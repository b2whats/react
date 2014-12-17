'use strict';
//yarr router mixin
var _ = require('underscore');
var page = require('page');

var kROUTE_PATH_IDX = 0;
var kROUTE_OBJECT_IDX = 1;
var kROUTE_HANDLER_IDX = 2;

module.exports = function(routes) {
  var initialize_guard = false;
  return {
    componentDidMount () {
      if(!initialize_guard) {
        initialize_guard = true;
        _.each(routes, function(route) {          
          if(typeof(route[kROUTE_PATH_IDX])==='string' && typeof(route[kROUTE_HANDLER_IDX]) === 'function') {            
            page(route[kROUTE_PATH_IDX], function(route_context) {              
              route[kROUTE_HANDLER_IDX](route[kROUTE_OBJECT_IDX], route_context);
            });          
          } else {
            console.error('bad types for route ', route[kROUTE_PATH_IDX]);
          }
        });
      }
      page.start({dispatch:true});
    }
  };
};


