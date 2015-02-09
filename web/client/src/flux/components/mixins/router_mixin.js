'use strict';
//yarr router mixin
var _ = require('underscore');
var page = require('page');

var kROUTE_HANDLER_IDX = 0;

module.exports = function(routes) {
  var initialize_guard = false;
  return {
    componentWillMount () {
      if(!initialize_guard) {
        initialize_guard = true;
        _.each(routes, function(route, route_path) {
          if(typeof(route_path)==='string' && typeof(route[kROUTE_HANDLER_IDX]) === 'function') {            
            page(route_path, (route_context, next) => {
              var r;
              for(var i=kROUTE_HANDLER_IDX; i<route.length;++i) {
                r = route[i](route_path, route_context, _.extend({},route_context.params));
                
                if(r && ('$__security__need_login__' in r)) {
                  route_context.handled = false;
                  break;
                }
              }
              
              //route_context.handled = false;
            });
          } else {
            console.error('bad types for route ', route);
          }
        });
      }
      page.start({dispatch:true, click: false});
    }
  };
};


