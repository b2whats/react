'use strict';

var resource = require('utils/resource.js');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');
var q = require('third_party/es6_promise.js');

var r_features_ = resource('/recommender/:sphere_id/features');
var r_filters_ = resource('/recommender/:sphere_id/filters');
var r_bins_ = resource('/recommender/:sphere_id/bins');


module.exports.recommender_load = function(route_context_params) {
  return q.all([
    r_features_.get(route_context_params),
    r_filters_.get(route_context_params),
    r_bins_.get(route_context_params)])
  .then(function(res) {
    main_dispatcher.fire.apply (main_dispatcher, [evt.kON_RECOMMENDER_DATA_LOADED].concat(res));//.concat([route_context_params])); //DID роут проапдейчен
    return res;
  });
};


module.exports.recommender_save = function(route_context_params, bins) {

  r_bins_.save(route_context_params, bins)
  .then(function(res) {
    main_dispatcher.fire(evt.kON_RECOMMENDER_DATA_SAVED);    
    return res;
  })
  .catch(function(e){
    console.error('recommender_save', e);
  });
};







