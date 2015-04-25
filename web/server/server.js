'use strict';

var config = require('../config.js');

//ГОВНОКОД ПЕРЕПИСАТЬ!!!

var kTOUCH_SESSION_TIME = Math.round(config.kUSER_TOKEN_EXPIRE / 100) + 1; //поведение сессии в коннекте немного не так как ожидаем, см мидлварку

var express = require('express');
var app = express();


var send = require('send');
var _ = require('underscore'); //перекинуть на lodash.underscore или на Lazy.js если вдруг захочеца оптимизировать когда нить

var uuid = require('node-uuid');

var ice_middlewares = require('ice_middlewares');

//var users_rest = require('./json_test/json_test.js');
//var recommender = require('./recommender/recommender.js');
//var suggester = require('./suggestion/suggestion.js');

//var hotels_router_fab =  require('./hotels/get_hotels_near.js')
//var passport = require('./auth_strategy/passport_init.js').init(config.kUSER_TOKEN_EXPIRE, config.kHOST_NAME);

//var ice_worker = require('ice_worker');

//------------------------------------------------------------------------------------------------------------

//var find_translation = require('./find_translation/find_translation.js');

//----------
var cookie_parser = require('cookie-parser');
var body_parser = require('body-parser');
var method_override = require('method-override');
var cookie_session = require('cookie-session');
var morgan  = require('morgan');

var validator = require('express-validator'); //крайне говеный валидатор - поискать получше

app.use(morgan('dev')); //вести лог



app.use(cookie_parser());

//app.use(body_parser.urlencoded())
app.use(body_parser.json()); //автоматом разбирать json
app.use(validator());

app.use(method_override()); //put and delete methods instead of <input type="hidden" name="_method" value="put" />


app.use(cookie_session({ secret: 'safdsdfsdfwerewcxc', cookie: { maxAge: config.kUSER_TOKEN_EXPIRE }})); //переделать на ... redis
app.use(ice_middlewares.session_touch_middleware(kTOUCH_SESSION_TIME));
//app.use(passport.initialize());
//app.use(passport.session());


//подготовить запрос-ответ данные
//if(config.kPREPARE_FOR_TEST){
//  app.use(ice_middlewares.save_request_response_middleware(__dirname +  '/../../data_test_save'));
//}



//app.use('/hotels_info', hotels_router_fab.create_router(app));
//app.use('/pages', users_rest.create_router(app));
//app.use('/recommender', recommender.create_router(app));
//app.use('/api', suggester.create_router(app));



//TODO в упор не помню нахера эта мидлварка - TODO стереть - (вроде для ведения логов)
function session_uid_middleware(){
  return function(req, res, next){
    if ('HEAD' == req.method || 'OPTIONS' == req.method) return next();
    if(!req.session._uid){
      req.session._uid = uuid.v1(); //Math.round(1*(new Date())/(ms_seconds)); //to force cookie update
    }
    next();
  };
}

/*назначать uid если неназначен нафига не помню*/
_.each(['/userinfo'], function(url){
  app.use(url, session_uid_middleware());
});

/*собсна это единственное что не кэшируется и если генерить куку то тут*/
app.get('/userinfo', function(req, res) {
  res.setHeader('content-type', 'application/javascript');
  if(req.isAuthenticated()){
    var user = _.pick(req.user, 'name', 'role');
    return res.send('window.$$$user = (function(){return '+JSON.stringify(user)+';})()');
  }
  return res.send('');
});


_.each([
  '/',
  '/account/:region_id/:id',
  '/test',
  '/page/:id',
  '/catalog/:region_id/:type/:brands/:services/:type_price',
  '/help',
  '/typeahead',
  '/sphere/:sphere_id',
  '/:id',
  '/find/:region_id/:sentence/:producer/:articul/:id',
  '/adv/:region_id/:service/:search_text',
  '/find/:region_id/:sentence/:producer/:articul/:id/:service/:service_auto_mark/:service_id',
  '/company/:company_id/:region_id'
  ],  function(route) {
  app.get(route, ice_middlewares.cache_middleware(config.kCACHE_MAIN_PAGE_SECONDS), function (req, res){

    function error(err) {
      res.statusCode = err.status || 500;
      res.end(err.message);
    }
    if(req.user)
      console.log('USER '+JSON.stringify(req.user));
    // your custom directory handling logic:
    function redirect() {
      res.statusCode = 301;
      res.setHeader('Location', req.url + '/');
      res.end('Redirecting to ' + req.url + '/');
    }

    send(req, 'index.html')
    .root(__dirname + config.kDEV_RELEASE)
    .on('error', error)
    .on('directory', redirect)
    .pipe(res);
  });
});


//----------------------------------------------------------------------------------
console.error('HERE I');
var server = require('http').createServer(app);

server.on('error', function(err){
  console.log('APP SERVER ERROR '+err);
});

server.listen(config.kPORT, '0.0.0.0', function(){
  console.log('APP SERVER STARTED AT PORT 3000');
});




