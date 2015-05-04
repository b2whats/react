'use strict';

var route_names = {
  kROUTE_DEF: '/',
  kROUTE_ACCOUNT: '/account/:region_id/:section',
  kROUTE_COMPANY: '/company/:company_id/:region_id',
  kROUTE_AFTER_REGISTER: '/after/register/:step/:region_id',
  kROUTE_DEF_W_REGION: '/:region_id',

  kROUTE_CATALOG: '/catalog/:region_id/:type/:brands/:services/:type_price',
  kROUTE_CATALOG_NEW: '/catalog_new/:region_id/:type/:brands/:services/:type_price',
  kROUTE_PARTS_FIND: '/find/:region_id/:sentence/:producer/:articul/:id/:service/:service_auto_mark/:service_id',
  kROUTE_ADV: '/adv/:region_id/:service/:search_text',

  kHELP_ROUTE: 'kHELP_ROUTE',
  kROUTE_TEST: '/test',
  kROUTE_TEST_N: '/test_n',

  kROUTE_R_A: '/r1',
  kROUTE_R_B: '/r2',
  kROUTE_R_C: '/r3',
  kROUTE_AGREEMENT: '/agreement',
};

module.exports = route_names;