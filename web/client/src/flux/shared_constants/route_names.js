'use strict';

var route_names = {
  kROUTE_DEF: '/',
  kROUTE_DEF_W_REGION: '/:region_id',
  
  kROUTE_CATALOG: '/catalog/:region_id/:type/:brands/:services',
  
  kROUTE_PARTS_FIND: '/find/:region_id/:sentence/:producer/:articul/:id/:service/:service_auto_mark/:service_id',
  kROUTE_ACCOUNT_INFO: '/:region_id/account/info',

  kHELP_ROUTE: 'kHELP_ROUTE'
};

module.exports = route_names;