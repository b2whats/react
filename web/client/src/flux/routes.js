'use strict';

var route_names = require('shared_constants/route_names.js');
var route_actions = require('actions/route_actions.js');
var page_actions = require('actions/page_actions.js');


var recommender_actions = require('actions/recommender_actions.js')

var routes = [
  ['/' ,          route_names.kDEFAULT_ROUTE, route_actions.default_route],
  ['/help',       route_names.kHELP_ROUTE,    route_actions.default_route],
  ['/sphere/:sphere_id', route_names.kSPHERE_ROUTE, route_actions.data_preload_route(recommender_actions.recommender_load)]
];

module.exports = routes;
