'use strict';

var route_names = {
  kROUTE_DEF: '/',
  kROUTE_DEF_W_REGION: '/:region_id',
  kDEFAULT_ROUTE: 'kDEFAULT_ROUTE',
  
  kROUTE_CATALOG: '/catalog/:region_id',
  kROUTE_PARTS_FIND: '/find/:region_id/:sentence/:producer/:articul/:id/:service/:service_auto_mark/:service_id',
  kFIND_ROUTE: 'kFIND_ROUTE',

  kROUTE_ACCOUNT_URI: '/account/company',
  kROUTE_ACCOUNT: 'kROUTE_ACCOUNT',

  kHELP_ROUTE: 'kHELP_ROUTE'
};

module.exports = route_names;