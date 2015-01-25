'use strict';

var route_names = require('shared_constants/route_names.js');
var route_definitions = route_names; //пока полежат в одном месте
var route_actions = require('actions/route_actions.js');
var region_actions = require('actions/region_actions.js');

var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
var autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');

var catalog_actions = require('actions/catalog_actions.js');
//дефолтный регион
var kDEFAULT_REGION_ID = 'sankt-peterburg';

var routes = {};

  
routes[route_definitions.kROUTE_DEF] = [
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route];
  
  
routes[route_definitions.kROUTE_DEF_W_REGION] = [ //при смене роута можно указать несколько подряд методов которые надо выполнить
    (route_name, route_context, route_context_params, route_defaults) => region_actions.region_changed(route_context_params.region_id),
    route_actions.default_route ];


routes[route_definitions.kROUTE_PARTS_FIND] = [ //route_definitions.kROUTE_PARTS_FIND, route_names.kFIND_ROUTE, 
    
    (route_name, route_context, route_context_params, route_defaults) => 
      region_actions.region_changed(route_context_params.region_id),
    
    (route_name, route_context, route_context_params, route_defaults) => 
      route_context_params.id === '_' ? auto_part_by_id_actions.reset_auto_part_data() :
        auto_part_by_id_actions.query_auto_part_by_id(route_context_params.region_id, route_context_params.id),
    
    (route_name, route_context, route_context_params, route_defaults) => 
      route_context_params.service_id === '_' ? autoservice_by_id_actions.reset_autoservice_data() : 
        autoservice_by_id_actions.query_autoservice_by_id(route_context_params.region_id, route_context_params.service_id),
    
    route_actions.default_route];

routes[route_definitions.kROUTE_ACCOUNT_URI] = [ //route_definitions.kROUTE_PARTS_FIND, route_names.kFIND_ROUTE,
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route];

routes[route_definitions.kROUTE_CATALOG] = [
  (route_name, route_context, route_context_params, route_defaults) => 
    region_actions.region_changed(route_context_params.region_id),

  () => catalog_actions.get_services_and_brands(),

  () => auto_part_by_id_actions.reset_auto_part_data(),
  () => autoservice_by_id_actions.reset_autoservice_data(),

  route_actions.default_route];  


module.exports = routes;
