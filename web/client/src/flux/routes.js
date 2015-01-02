'use strict';

var route_names = require('shared_constants/route_names.js');
var route_definitions = route_names; //пока полежат в одном месте
var route_actions = require('actions/route_actions.js');
var region_actions = require('actions/region_actions.js');


//дефолтный регион
var kDEFAULT_REGION_ID = 3;

var routes = [
  [route_definitions.kROUTE_DEF,          route_names.kDEFAULT_ROUTE, 
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route],
  
  ['/help',       route_names.kHELP_ROUTE,    route_actions.default_route],
  
  [route_definitions.kROUTE_DEF_W_REGION, route_names.kDEFAULT_ROUTE, //при смене роута можно указать несколько подряд методов которые надо выполнить
    (route_name, route_context, route_context_params) => region_actions.region_changed(route_context_params.region_id),
    route_actions.default_route ],

  [route_definitions.kROUTE_FIND, route_names.kFIND_ROUTE, route_actions.default_route]
  

  //['/sphere/:sphere_id', route_names.kSPHERE_ROUTE, route_actions.data_preload_route(recommender_actions.recommender_load)],
];

module.exports = routes;
