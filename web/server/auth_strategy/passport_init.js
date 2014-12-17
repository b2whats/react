'use strict';

var config = require(__config+'config.js');

var passport =  require('passport');

var db = require('ice_db')(config.kDB.path, require(config.kDB.model));//новый вариант инициализации

var _ = require('underscore');
var ice_time = require('ice_time');
var uuid = require('node-uuid');

var SolverPassportStrategy = require('./solver_strategy.js').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function init(kUSER_TOKEN_EXPIRE, host_name){
  if(!host_name) host_name = 'http://www.local-solvertour.ru';
  //как сделать просмотр будучи другим юзером
  //надо наебать систему. но так чтоб сам юзер не мог этого сделать.
  //и второе не выкидывать юзера при этом из системы

  //TODO перевести на редиску

  passport.serializeUser(function(user, done) {
    done(null, user.token);
  });

  //TODO: тоже перетянуть на локальный кэш десериализацию, но для этого надо убрать мастерюзера
  passport.deserializeUser(function(token, done) {
    var start_time = ice_time();
    var kUSER_UPDATE_LAST_LOGIN = 10*60*1000;
    db.User.findOne({token:token},'name role token last_login master_token tasks_can_do').lean().exec(function(e, db_user){
      if(e) return done(e);
      if(db_user===null) return done(null, false);

      //if(db_user.master_token===undefined || 

      var curr_time = ice_time();
      //if(db_user.master_token.value===undefined || db_user.master_token.value===null || curr_time - db_user.master_token.expiration > kUSER_MASTER_TOKEN_EXPIRE) //login as usual
      //{
      //УБИТЬ МАСТЕТОКЕНА      
      var expire_time = (new Date()) - db_user.last_login;
      console.log('USER LOADED '+(curr_time - start_time));
      if(expire_time < kUSER_TOKEN_EXPIRE){
        done(e, db_user);
        //и обновить юзеру ласт логин
        if(expire_time > kUSER_UPDATE_LAST_LOGIN){
          db.User.update({_id:db_user._id}, {last_login:new Date()}).q_exec()
            .then(function(upd_count){
              console.log('UPDATE EXPIRATIOn', upd_count);
            });
        }

      } else {
        console.error('TOKEN EXPIRED');
        done(null, false);
      }
      /**
       * пока убрать мастерюзера, потом может пригодиться
       */
      /*
      }else
      {
        //login as user in master_token
        db.User.findOne({_id:db_user.master_token.value},'name role token last_login master_token tasks_can_do').lean().exec(function(e, db_sub_user){
           if(e) return done(e);
           //var user = db_sub_user.toObject();
           db_sub_user.token = token; //токен админа
           console.log('SUB USER LOADED');
           done(e, db_sub_user);
        });
      }
      */

    });
  });

  passport.use(new SolverPassportStrategy(
    function(user, done) {

      db.User.findOne({uid_ext:user.id},'name uid_ext role token').exec(function(err, db_user){
        if(err) return done(null, false, { message: 'Unknown db error'});
        if(db_user===null)
        {
          db_user = new db.User({name:user.name, uid_ext:user.id, token:user.token, role:'###travel_agency_operator'});
        }
        
        _.extend(db_user, user);

        if(db_user.isModified()){
          db_user.save(function(e){
            console.log('USER SAVED');
            return done(e, db_user.toObject());
          });
        }
        console.log(db_user.toObject());

        
      });
  }));

  //GoogleStrategy

  passport.use(new GoogleStrategy({
      callbackURL: host_name+'/auth/google/return',
      //realm: host_name+'/'
      clientID: config.kPASSPORT.clientID, //'974168997044-q386nhh16pgoecmtsd05oloem8g81bc1.apps.googleusercontent.com',
      clientSecret: config.kPASSPORT.clientSecret
    },
    function(accessToken, refreshToken, profile, done) {
      
      var token = uuid.v1();
      var last_login = new Date();
      var name = profile.displayName;
      var email = profile.emails[0].value;
      console.log('email', email);

      db.User.findOneAndUpdate( {email:email}, //what
                                          {token:token, name:name, email:email, last_login:last_login}, //update
                                          {'upsert':true}).q_exec() //options
      .then(function(user){
        console.log('user.toObject()',user.toObject());
        done(null, user.toObject());
      })
      .catch(function(err){
        console.error(err);
        done(err, null);
      }).done();
      /*
        identifier https://www.google.com/accounts/o8/id?id=AItOawng0SNKUtTPhW2S4Ste8JAo2duPMbunlMw
        profile { displayName: 'ivan starkov',
        emails: [ { value: 'istarkov@gmail.com' } ],
        name: { familyName: 'starkov', givenName: 'ivan' } }
      */
      
      /*
      db.User.findOrCreate({ uid_ext: identifier },'name uid_ext role token', function(err, user) {
        done(err, user);
      });
      */
    }
  ));




  return passport;
}

module.exports.init = init;