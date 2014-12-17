'use strict';

var resource = require('utils/resource.js');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');

var r_pages_ = resource('/pages/page/:id');

module.exports.get = function(route_context) {
  return r_pages_
    .get(route_context.params)
    .then(function(page_obj){
      main_dispatcher.fire(evt.kON_PAGE_CHANGED, page_obj); //DID роут проапдейчен
      return page_obj;
    })
    .catch(function(e){
      console.error('::::page_route fail::::', e);
      throw e;
    });  
};
