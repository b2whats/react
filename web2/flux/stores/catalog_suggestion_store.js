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

  show_value: {index:-1, search_term:''},

  company_type: {index:-1, id: 2, search_term: _.find(sc.kORGANIZATION_TYPES, ot => ot.id === 2).title},
  company_type_price: {index:-1, id: 1, search_term: _.find(sc.kORGANIZATION_PRICE_TYPES, ot => ot.id === 1).title},

  //list_state: null,
  //search_term: '',
  //value: {},
  //show_value: {index:0, search_term:''}
});


var cncl_ = [
  main_dispatcher
  .on(event_names.kON_CATALOG_BRANDS_DATA_LOADED, brands => {  
    state_.brands_cursor
      .update(() => immutable.fromJS(brands).sortBy(v => v.get('name')));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY), 
  
  main_dispatcher
  .on(event_names.kON_CATALOG_SERVICES_DATA_LOADED, services => {  
    state_.services_cursor
      .update(() => immutable.fromJS(services));
    
    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_CATALOG_PARAMS_CHANGED, (company_type, brands, services, price_type) => {
    
    //console.log('company_type, brands, services', company_type, brands, services);
    var company_object = _.find(sc.kORGANIZATION_TYPES, ot => ot.id === (company_type - 1));
    state_.company_type_cursor
      .update(company => 
        company
          .set('index', company.get('index')-1)
          .set('search_term', company_object.title)
          .set('id', company_object.id));

      var company_object_price = _.find(sc.kORGANIZATION_PRICE_TYPES, ot => ot.id == price_type);
      state_.company_type_price_cursor
        .update(company =>
          company
            .set('index', company.get('index')-1)
            .set('search_term', company_object_price.title)
            .set('id', company_object_price.id));

    var im_brands = immutable.fromJS(brands);    
    state_.brand_tags_cursor
      .update( () => 
        im_brands
          .map(brand_id => 
            state_.brands.find(b => b.get('id') === brand_id))
          .filter( b => !!b));

    var im_services = immutable.fromJS(services);    
    state_.service_tags_cursor
      .update( () => 
        im_services
          .map(service_id => 
            state_.services.find(s => s.get('id') === service_id))
          .filter( s => !!s));

    state_.show_value_cursor
      .update(v => v.set('index', v.get('index') - 1));

    catalog_suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_CATALOG_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),


/*

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
*/

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

  get_company_type() {
    return state_.company_type;
  },
  get_company_type_price() {
    return state_.company_type_price;
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











