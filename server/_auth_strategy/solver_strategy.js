var passport = require('passport'),
    util = require('util'),
    _ = require('underscore'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    BadRequestError = require('./badrequesterror.js');


function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('solver authentication strategy requires a verify function');
  

  passport.Strategy.call(this);
  
  this.key_ = options.key || 'QPVu01pOKzLn+H+8T+TpvQ==';
  this.params_key_ = options.params_key || 'cypher';
  this.name = 'solver';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
  options = options || {};

  //decipher
  var user = {};
  try{
    var key = this.key_;
    var raw = req.params[this.params_key_];
    var params = raw.split(';', 2);
    var data = params[0];
    var iv = params[1];
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    iv = iv.replace(/-/g, '+').replace(/_/g, '/');

    var bin_data = new Buffer(data, 'base64');
    var bin_iv = new Buffer(iv, 'base64');
    var bin_key = new Buffer(key, 'base64');

    var decipher = crypto.createDecipheriv('aes-128-cbc', bin_key, bin_iv);
    var dec = decipher.update(bin_data, 'binary');
    dec += decipher.final();
    
    _.extend(user, JSON.parse(dec));
  }catch(e)
  {
    console.error('error'+JSON.stringify(e));
    return this.fail(new BadRequestError(options.badRequestMessage || 'cant parse credentials'));
  }

  user.token = uuid.v1();
  user.last_login = new Date();

  if (!('name' in user && 'id' in user)) {
    console.error('error ');
    return this.fail(new BadRequestError(options.badRequestMessage || 'Missing credentials'));
  }
  
  var self = this;
  
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  
  if (self._passReqToCallback) {
    this._verify(req, user, verified);
  } else {
    this._verify(user, verified);
  }
  
};

module.exports.Strategy = Strategy;
