'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');

var page = require('page'); //router
var route_template = require('utils/route_template.js');

var route_templates_cache_ = {};

module.exports.default_route = function(route_name, route_context) {
  //console.log('pageroute', route_context);
  main_dispatcher.fire(evt.kON_ROUTE_WILL_CHANGE, route_name, route_context); //WILL перед апдейтом роута
  main_dispatcher.fire(evt.kON_ROUTE_DID_CHANGE, route_name, route_context); //DID роут проапдейчен
};


module.exports.data_preload_route = function (route_data_promise) { 
  return function(route_name, route_context) {
    main_dispatcher.fire(evt.kON_ROUTE_WILL_CHANGE, route_name, route_context); //WILL перед апдейтом роута

    return route_data_promise(_.extend({},route_context.params))
      .then(function(){
        main_dispatcher.fire(evt.kON_ROUTE_DID_CHANGE, route_name, route_context); //DID роут проапдейчен
      })
      .catch(function(e){
        console.error('::::data_preload_route fail::::', e, e.stack);
        main_dispatcher.fire(evt.kON_ROUTE_CHANGE_ERROR, route_name, route_context);
        throw e;
      });  
      
  };
};


module.exports.goto_link = function (link) {
  page(link);
};


//подставляет парамеры в линки типа /x/:id
//по хорошему все переходы по линкам должны идти через именно эту функцию
module.exports.goto_link_w_params = function (link, params) {  
  if(!(link in route_templates_cache_)) route_templates_cache_[link] = route_template(link);
  var link_template = route_templates_cache_[link];  
  var evaluated_link = link_template(params);
  page(evaluated_link);
};
