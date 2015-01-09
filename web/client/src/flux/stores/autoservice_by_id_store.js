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

var kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY =  sc.kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  autoservice_data: null
});

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_BY_ID_DATA_LOADED, (autoservice_data) => {  

    state_.autoservice_data_cursor
      .update(() => immutable.fromJS(autoservice_data));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_BY_ID_RESET_DATA, () => {  

    state_.autoservice_data_cursor
      .update(() => immutable.fromJS(null));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),



];

var autoservice_by_id_store = merge(Emitter.prototype, {
  get_autoservice_data_header () {
    return state_.autoservice_data && state_.autoservice_data.get('header');
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = autoservice_by_id_store;

