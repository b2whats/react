'use strict';

var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');


module.exports.default_route = function(route_name, route_context) {
  //console.log('pageroute', route_context);
  main_dispatcher.fire(evt.kON_ROUTE_WILL_CHANGE, route_name, route_context); //WILL перед апдейтом роута
  main_dispatcher.fire(evt.kON_ROUTE_DID_CHANGE, route_name, route_context); //DID роут проапдейчен
};


module.exports.data_preload_route = function (route_data_promise) { 
  return function(route_name, route_context) {
    main_dispatcher.fire(evt.kON_ROUTE_WILL_CHANGE, route_name, route_context); //WILL перед апдейтом роута

    return route_data_promise(route_context.params)
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
