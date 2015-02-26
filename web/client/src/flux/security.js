'use strict';

var auth_actions = require('actions/auth_actions.js');
var auth_store = require('stores/auth_store.js');
var routes_store = require('stores/routes_store.js');
var route_actions = require('actions/route_actions.js');
var route_names = require('shared_constants/route_names.js');
var route_definitions = route_names; //пока полежат в одном месте


module.exports = (path_role, security_options) => {
  return (route_name, route_context, route_context_params) => {
    if(!auth_store.is_auth()) {
      
      security_options.pre_auth(path_role, route_name, route_context, route_context_params);
      
      var promise = auth_actions.check_auth(); //первоначальная проверка может быть все еще не закончена, подождать
      promise.then(() => {
        if(!routes_store.get_route_changed()) { //если это первый заход то бросить на основную
          if(!auth_store.is_auth()) {
            route_actions.goto_link(route_definitions.kROUTE_DEF);
          } else {
            route_actions.goto_link(route_context.path);
          }          
        }
      });

      return {'$__security__need_login__': true}; //остановить переход
    }
  };
};
