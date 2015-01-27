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
  brand_tags: [],

  services: [],
  service_tags: [],

  show_value: {index:-1, search_term:''}

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
    
    if(!state_.brand_tags.some(bt => bt.get('id') === brand_object.id)) {
      state_.brand_tags_cursor
        .update( brand_tags => brand_tags.push(immutable.fromJS(brand_object)));
    }

    state_.show_value_cursor
      .update(v => v.set('index', v.get('index') - 1));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_CATALOG_REMOVE_BRAND_TAG, id => {  
    

    state_.brand_tags_cursor
      .update( brand_tags => brand_tags.filter(bt => bt.get('id')!==id));

    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_CATALOG_APPEND_SERVICE_TAG, service_object => {  
    
    if(!state_.service_tags.some(st => st.get('id') === service_object.id)) {
      state_.service_tags_cursor
        .update( service_tags => service_tags.push(immutable.fromJS(service_object)));
    }

    state_.show_value_cursor
      .update(v => v.set('index', v.get('index') - 1));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_CATALOG_REMOVE_SERVICE_TAG, id => {  

    state_.service_tags_cursor
      .update( service_tags => service_tags.filter(bt => bt.get('id')!==id));

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


  get_service_tags () {
    return state_.service_tags;
  },

  get_brand_tags() {
    return state_.brand_tags;
  },

  get_show_value() {
    return state_.show_value;
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











