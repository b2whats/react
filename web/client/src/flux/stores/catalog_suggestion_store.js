'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY =  sc.kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  brands: [],
  services: [],
  brand_tags: []
  //list_state: null,
  //search_term: '',
  //value: {},
  //show_value: {index:0, search_term:''}
});


var cncl_ = [
  main_dispatcher
  .on(event_names.kON_CATALOG_BRANDS_DATA_LOADED, brands => {  
    state_.brands_cursor
      .update(() => immutable.fromJS(brands));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY), 
  
  main_dispatcher
  .on(event_names.kON_CATALOG_SERVICES_DATA_LOADED, services => {  
    state_.services_cursor
      .update(() => immutable.fromJS(services));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_CATALOG_APPEND_BRAND_TAG, brand_object => {  
    state_.brand_tags_cursor
      .update( brand_tags => brand_tags.push(immutable.fromJS(brand_object)));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),




];


var catalog_suggestion_store = merge(Emitter.prototype, {
  get_brands () {
    return state_.brands;
  },

  get_services () {
    return state_.services;
  },

  get_brand_tags() {
    return state_.brand_tags;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = catalog_suggestion_store;











