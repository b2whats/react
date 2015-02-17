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
  loaded: false,
  file_name: null,
  errors: [],
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
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED, (file_name) => {
    update_state_param('loaded', true);
    update_state_param('file_name', file_name);
  }, kDEFAULT_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS, (errors, file_name) => {
    update_state_param('errors', errors);
    update_state_param('file_name', file_name);
  }, kDEFAULT_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_RESET, () => {
    update_state_param('loaded', false);
    update_state_param('errors', []);
    update_state_param('file_name', null);
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

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = account_manage_store;

