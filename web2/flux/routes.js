const _ = require('underscore');

import route_names from 'shared_constants/route_names.js';
const route_definitions = route_names; //пока полежат в одном месте
const route_actions = require('actions/route_actions.js');
const region_actions = require('actions/region_actions.js');
const security = require('./security.js');

const auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
const auto_part_search_actions = require('actions/auto_part_search_actions.js');
const autoservices_search_actions = require('actions/autoservices_search_actions.js');
const account_page_actions = require('actions/account_page_actions.js');
const autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');
const catalog_data_actions = require('actions/catalog_data_actions.js');

const catalog_actions = require('actions/catalog_actions.js');
const catalog_data_actions_new = require('actions/catalog_data_actions_new.js');

const account_services_actions = require('actions/admin/services_actions.js');
const account_statistics_actions = require('actions/admin/statistics_actions.js');
const account_manage_actions = require('actions/admin/account_manage_actions.js');
const price_list_selector_actions = require('actions/admin/price_list_selector_actions.js');

const modal_actions = require('actions/ModalActions.js');
const auth_actions = require('actions/auth_actions.js');

const personal_company_page = require('actions/personal_company_page_actions.js');

const ap_search_actions = require('actions/auto_part_search_actions.js');
//дефолтный регион
const kDEFAULT_REGION_ID = 'moskva';

const searchAutoPartsActions = require('actions/searchActionsAP.js');
const searchAutoServicesActions = require('actions/searchActionsAS.js');






//получать с сервера

const routes = {};

//ЧАСТЬ ОТВЕЧАЮЩАЯ ЗА ЛОГИН
const auth_options = {
  pre_auth(path_role, route_name, route_context, route_context_params) {
    auth_actions.save_path(route_context.path);
    modal_actions.openModal('signin');
  },
};

const kSECURITY_NEED_AUTH = security(null, auth_options);

routes[route_definitions.kROUTE_AGREEMENT] = [

  () => region_actions.region_changed(kDEFAULT_REGION_ID),

  route_actions.default_route
];

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

routes[route_definitions.kROUTE_PARTS_FIND_NEW] = [ //route_definitions.kROUTE_PARTS_FIND, route_names.kFIND_ROUTE,
  //(route_name, route_context, route_context_params) => console.log('kROUTE_R_A', route_name, route_context, route_context_params),
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),

  (route_name, route_context, route_context_params) =>
    catalog_data_actions.reset_catalog_data(),

  (route_name, route_context, route_context_params) =>
      searchAutoPartsActions.queryAutoPartsData(route_context_params.region_id, route_context_params.id),

  (route_name, route_context, route_context_params) =>
    searchAutoServicesActions.queryAutoServicesData(route_context_params.region_id, route_context_params.service_id),

/*  (route_name, route_context, route_context_params) =>
    route_context_params.service_id === '_' ? autoservice_by_id_actions.reset_autoservice_data() :
      autoservice_by_id_actions.query_autoservice_by_id(route_context_params.region_id, route_context_params.service_id),*/

  route_actions.default_route];

routes[route_definitions.kROUTE_CATALOG] = [
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),

  (route_name, route_context, route_context_params) =>
    catalog_actions.get_services_and_brands(
      route_context_params.type,
      route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
      route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v),
      route_context_params.type_price
    ),

  (route_name, route_context, route_context_params) =>
    auto_part_by_id_actions.reset_auto_part_data(),

  (route_name, route_context, route_context_params) =>
    autoservice_by_id_actions.reset_autoservice_data(),

  (route_name, route_context, route_context_params) =>
    catalog_data_actions.query_catalog_data(route_context_params.type,
    route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
    route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v),
    route_context_params.region_id,
      route_context_params.type_price
    ),

  route_actions.default_route];


routes[route_definitions.kROUTE_CATALOG_NEW] = [
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),

  (route_name, route_context, route_context_params) =>
    catalog_actions.get_services_and_brands(
      route_context_params.type,
      route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
      route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v),
      route_context_params.type_price
    ),

  (route_name, route_context, route_context_params) =>
    auto_part_by_id_actions.reset_auto_part_data(),

  (route_name, route_context, route_context_params) =>
    autoservice_by_id_actions.reset_autoservice_data(),

  (route_name, route_context, route_context_params) =>
    catalog_data_actions_new.queryCatalogData(route_context_params.type,
    route_context_params.brands === '_' ? [] :   _.map(route_context_params.brands.split(','),   v => +v),
    route_context_params.services === '_' ? [] : _.map(route_context_params.services.split(','), v => +v),
    route_context_params.region_id,
      route_context_params.type_price
    ),
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
        case 'statistics':
          account_statistics_actions.getStatistics();
          account_statistics_actions.getOrderStatistics();
          break;
        case 'manage':
          price_list_selector_actions.load_price_list_data();
          account_manage_actions.get_price_history_information();
          break;
        case 'manage-history':
          account_manage_actions.get_price_history_information();
          break;
        }
      },
      route_actions.default_route
];

routes[route_definitions.kROUTE_ADV] = [
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),

  (route_name, route_context, route_context_params) =>
    catalog_data_actions.reset_catalog_data(),

  async (route_name, route_context, route_context_params) => {
    if (route_context_params.service === 'autoparts') {

      let suggest = await auto_part_search_actions.query_auto_parts(route_context_params.search_text);

      if (suggest[0] && suggest[0][0]) {
        searchAutoPartsActions.queryAutoPartsData(route_context_params.region_id, suggest[0][0]);
      }
      searchAutoServicesActions.queryAutoServicesData(route_context_params.region_id, 'all')
    }
    if (route_context_params.service === 'autoservices') {
      let suggest = await autoservices_search_actions.query_service(route_context_params.search_text);

      if (suggest[0] && suggest[0][0]) {
        searchAutoServicesActions.queryAutoServicesData(route_context_params.region_id, suggest[0][0]);
      }

    }

  },

  route_actions.default_route];


routes[route_definitions.kROUTE_COMPANY] = [
  (route_name, route_context, route_context_params) =>
    region_actions.region_changed(route_context_params.region_id),
  (route_name, route_context, route_context_params) =>
    personal_company_page.get_company_information(route_context_params.company_id),
  route_actions.default_route];


routes[route_definitions.kROUTE_AFTER_REGISTER] = [
  (route_name, route_context, route_context_params) => {
    region_actions.region_changed(route_context_params.region_id);
    account_services_actions.get_services_information();
    account_page_actions.get_company_filial();
    account_page_actions.get_company_information();
  },
  route_actions.default_route];

module.exports = routes;
