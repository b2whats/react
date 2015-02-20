'use strict';

var _ = require('underscore');
var route_names = require('shared_constants/route_names.js');
var route_definitions = route_names; //пока полежат в одном месте
var route_actions = require('actions/route_actions.js');
var region_actions = require('actions/region_actions.js');

var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
var account_page_actions = require('actions/account_page_actions.js');
var autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');
var catalog_data_actions = require('actions/catalog_data_actions.js');

var catalog_actions = require('actions/catalog_actions.js');

var account_services_actions = require('actions/admin/services_actions.js');


//дефолтный регион
var kDEFAULT_REGION_ID = 'sankt-peterburg';

var routes = {};

//как работает авторизация
//если не авторизован то либо показывает окно логина либо показывает окно логина
//сохраняет путь и параметры

//ЧАСТЬ ОТВЕЧАЮЩАЯ ЗА ЛОГИН
var auth_options = {
  pre_auth(path_auth, path_role, route_name, route_context, route_context_params) {
    auth_actions.save_path(route_context.path);
    modal_actions.open_modal('signin');
  },
};

var modal_actions = require('actions/modal_actions.js');
var auth_actions = require('actions/auth_actions.js');
var auth_store = require('stores/auth_store.js');
var routes_store = require('stores/routes_store.js');

var security = (path_auth, path_role, security_options) => {
  return (route_name, route_context, route_context_params) => {

    if(path_auth) {
      if(!auth_store.is_auth()) {
        var promise = auth_actions.check_auth();

        security_options.pre_auth(path_auth, path_role, route_name, route_context, route_context_params);
        if (promise != undefined) {
          //если первый логин переотправить на основную
          if(!routes_store.get_route_changed()) {
            promise.then(() => {
              //console.log(auth_store.is_auth());
              if(!auth_store.is_auth()) {
                //console.log('route_actions.goto_link');

                route_actions.goto_link(route_definitions.kROUTE_DEF);
              }
            });

          }
        }

        return {'$__security__need_login__': true};
      }
    }
  }
};
//ЧАСТЬ ОТВЕЧАЮЩАЯ ЗА ЛОГИН


var kNEED_AUTH = true;
var kNO_NEED_AUTH = false;

var kSECURITY_NEED_AUTH = security(kNEED_AUTH, null, auth_options);

routes[route_definitions.kROUTE_R_A] = [
  (route_name, route_context, route_context_params) => console.log('kROUTE_R_A', route_name, route_context, route_context_params),
  (route_name, route_context, route_context_params) =>
  region_actions.region_changed(route_context_params.region_id || kDEFAULT_REGION_ID),

  route_actions.default_route
];

routes[route_definitions.kROUTE_R_B] = [
  () => console.log('kROUTE_R_B'),

  kSECURITY_NEED_AUTH,

  (route_name, route_context, route_context_params) =>
  region_actions.region_changed(route_context_params.region_id || kDEFAULT_REGION_ID),

  route_actions.default_route
];

routes[route_definitions.kROUTE_R_C] = [
  () => console.log('kROUTE_R_C'),

  kSECURITY_NEED_AUTH,

  (route_name, route_context, route_context_params) =>
  region_actions.region_changed(route_context_params.region_id || kDEFAULT_REGION_ID),

  route_actions.default_route
];


routes[route_definitions.kROUTE_TEST] = [
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route];

routes[route_definitions.kROUTE_TEST_N] = [
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route];




routes[route_definitions.kROUTE_DEF] = [
    () => region_actions.region_changed(kDEFAULT_REGION_ID), //загрузить асинхронно регион оп умолчанию
    route_actions.default_route];


routes[route_definitions.kROUTE_DEF_W_REGION] = [ //при смене роута можно указать несколько подряд методов которые надо выполнить
    (route_name, route_context, route_context_params) => region_actions.region_changed(route_context_params.region_id),
    route_actions.default_route ];






routes[route_definitions.kROUTE_PARTS_FIND] = [ //route_definitions.kROUTE_PARTS_FIND, route_names.kFIND_ROUTE,
    //(route_name, route_context, route_context_params) => console.log('kROUTE_R_A', route_name, route_context, route_context_params),
    (route_name, route_context, route_context_params) =>
      region_actions.region_changed(route_context_params.region_id),

    (route_name, route_context, route_context_params) =>
      catalog_data_actions.reset_catalog_data(),

    (route_name, route_context, route_context_params) =>
      route_context_params.id === '_' ? auto_part_by_id_actions.reset_auto_part_data() :
        auto_part_by_id_actions.query_auto_part_by_id(route_context_params.region_id, route_context_params.id),

    (route_name, route_context, route_context_params) =>
      route_context_params.service_id === '_' ? autoservice_by_id_actions.reset_autoservice_data() :
        autoservice_by_id_actions.query_autoservice_by_id(route_context_params.region_id, route_context_params.service_id),

    route_actions.default_route];



routes[route_definitions.kROUTE_CATALOG] = [
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),

  (route_name, route_context, route_context_params) =>
    catalog_actions.get_services_and_brands(
      route_context_params.type,
      route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
      route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v)
    ),

  (route_name, route_context, route_context_params) =>
    auto_part_by_id_actions.reset_auto_part_data(),

  (route_name, route_context, route_context_params) =>
    autoservice_by_id_actions.reset_autoservice_data(),

  (route_name, route_context, route_context_params) =>
    catalog_data_actions.query_catalog_data(route_context_params.type,
    route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
    route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v),
    route_context_params.region_id),

  route_actions.default_route];

routes[route_definitions.kROUTE_ACCOUNT] = [
      kSECURITY_NEED_AUTH,
      (route_name, route_context, route_context_params) => {
        region_actions.region_changed(route_context_params.region_id)
      },
      (route_name, route_context, route_context_params) => {
        switch (route_context_params.section) {
          case 'company':
            account_page_actions.get_company_filial();
            account_page_actions.get_company_information();
            break;
          case 'services':
            account_services_actions.get_services_information();
            break;
        }
      },
      route_actions.default_route
];

module.exports = routes;
