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
var account_page_store = require('stores/account_page_store.js');

var kDEFAULT_STORE_PRIORITY = sc.kDEFAULT_STORE_PRIORITY;

var state_ =  init_state(_.last(__filename.split('/')), {
  
  price_properties: {
    'goods_quality' : '1',
    'delivery_time' : '1'
  },
  history : {},
  price_list_content: '',
  loaded: false,
  file_name: null,
  errors: [],
  price_type: 1

});

function update_state_param(param_name, value) {
  var im_value = immutable.fromJS(value);

  if(!immutable.is(state_[param_name], im_value)) {
    state_[param_name+'_cursor']
      .update(() => im_value);
    account_manage_store.fire(event_names.kON_CHANGE);
  }
}

var cncl_ = [  



  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_TYPE_CHANGED, price_type => {
    update_state_param("price_type", price_type);      
  }, kDEFAULT_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED, (file_name) => {
    update_state_param('loaded', true);
    update_state_param('file_name', file_name);
  }, kDEFAULT_STORE_PRIORITY),

  main_dispatcher
    .on(event_names.kACCOUNT_PRICE_INFO_LOADED, (data) => {
      state_.history_cursor
        .update(() => immutable.fromJS(data.data));
      account_manage_store.fire(event_names.kON_CHANGE);
    }, kDEFAULT_STORE_PRIORITY),
  main_dispatcher
    .on(event_names.kACCOUNT_PRICE_DELETE, (id) => {
        console.log(id);
      state_.history_cursor
        .update((l) => l.filter(b => b.get('id') !== id));
      account_manage_store.fire(event_names.kON_CHANGE);
    }, kDEFAULT_STORE_PRIORITY),




  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS, (errors, file_name) => {
    update_state_param('errors', errors);
    update_state_param('file_name', file_name);
      account_manage_store.fire(event_names.kON_CHANGE);
  }, kDEFAULT_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_RESET, () => {
    update_state_param('loaded', false);
    update_state_param('errors', []);
    update_state_param('file_name', null);
  }, kDEFAULT_STORE_PRIORITY),



  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_CONTENT_CHANGED, content => {
    update_state_param('price_list_content', content);
  }, kDEFAULT_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED, (name, value) => {
    if(state_.price_properties.get(name) !==value) {
      state_.price_properties_cursor
        .cursor([name])
        .update(() => value);
      account_manage_store.fire(event_names.kON_CHANGE);
    }
  }, kDEFAULT_STORE_PRIORITY),



];


var account_manage_store = merge(Emitter.prototype, {
  get_loaded() {
    return state_.loaded;
  },
  get_file_name() {
    return state_.file_name;
  },

  get_errors() {
    return state_.errors;
  },

  get_price_properties() {
    return state_.price_properties;
  },

  get_price_list_content() {
    return state_.price_list_content;
  },
  get_history() {
    return state_.history;
  },

  get_price_type() {
    return state_.price_type;
  },


  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = account_manage_store;

