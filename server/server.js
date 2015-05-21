'use strict';

//require("babel-core/external-helpers");
//require("babel-core/polyfill");
var path = require('path');
//var q = Promise;//require('q');
var config = require('../config.js');

var express = require('express');
var app = express();
var _ = require('underscore'); //перекинуть на lodash.underscore или на Lazy.js если вдруг захочеца оптимизировать когда нить

var cookie_parser = require('cookie-parser');
var body_parser = require('body-parser');
var method_override = require('method-override');
//var cookie_session = require('cookie-session');
var morgan  = require('morgan');
var validator = require('express-validator'); //крайне говеный валидатор - поискать получше

app.use(morgan('dev')); //вести лог
app.use(cookie_parser());
app.use(body_parser.json()); //автоматом разбирать json
app.use(validator());
app.use(method_override()); //put and delete methods instead of <input type="hidden" name="_method" value="put" />
app.use('/_assets', express.static(path.join(__dirname, '..', 'build/public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'web2/assets')));

//app.use(cookie_session({ secret: 'safdsdfsdfwerewcxc', cookie: { maxAge: config.kUSER_TOKEN_EXPIRE }})); //переделать на ... redis

//wait all thenable objects initialized
Promise.all([
  //require('./liteurl/urllite.js'),
  //require('./send_order/send_order.js'),
  //require('./trace/trace.js'),
  require('./main.js'),
  require('./g.js'),
])
.then(routes => {
  _.each(routes, 
    route => 
      app.use(route));

  var server = require('http').createServer(app);

  server.on('error', function(err){
    console.log('APP SERVER ERROR '+err);
  });

  server.listen(config.kPORT, '0.0.0.0', function(){
    console.log('APP SERVER STARTED AT PORT ' + config.kPORT);
  });
});
