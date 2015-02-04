'use strict';

var route_names = {
  kROUTE_DEF: '/',
  kROUTE_ACCOUNT: '/account/:region_id/:section',

  kROUTE_DEF_W_REGION: '/:region_id',

  kROUTE_CATALOG: '/catalog/:region_id/:type/:brands/:services',
  kROUTE_PARTS_FIND: '/find/:region_id/:sentence/:producer/:articul/:id/:service/:service_auto_mark/:service_id',

  kHELP_ROUTE: 'kHELP_ROUTE',
  kROUTE_TEST: '/test',
  kROUTE_TEST_N: '/test_n'
};

module.exports = route_names;