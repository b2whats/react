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


var kDEFAULT_STORE_PRIORITY = sc.kDEFAULT_STORE_PRIORITY;

var state_ = init_state(_.last(__filename.split('/')), {
  statistics: {},
  orderStatistics: [],
  orderStatisticsSubscribe: [],
  currentService: 'c'
});



var cncl_ = [  



  main_dispatcher
  .on(event_names.kON_ON_ACCOUNT_STATISTICS_LOADED, statistics => {
        state_.statistics_cursor
          .update(() => immutable.fromJS(statistics));
      account_manage_store.fire(event_names.kON_CHANGE);
  }, kDEFAULT_STORE_PRIORITY),
  main_dispatcher
    .on(event_names.kON_ON_ACCOUNT_ORDER_STATISTICS_LOADED, orderStatistics => {
      orderStatistics.order && state_.orderStatistics_cursor
        .update(() => immutable.fromJS(orderStatistics.order));
      orderStatistics.order_subscribe && state_.orderStatisticsSubscribe_cursor
        .update(() => immutable.fromJS(orderStatistics.order_subscribe));
      account_manage_store.fire(event_names.kON_CHANGE);
    }, kDEFAULT_STORE_PRIORITY),
  main_dispatcher
    .on(event_names.kON_ON_ACCOUNT_STATISTICS_FORM_UPDATE, field => {
      state_.currentService_cursor
        .update(() => field);
      account_manage_store.fire(event_names.kON_CHANGE);
    }, kDEFAULT_STORE_PRIORITY),


];


var account_manage_store = merge(Emitter.prototype, {
  getStatistics() {
    return state_.statistics;
  },
  getCurrentService() {
    return state_.currentService;
  },
  getOrderStatistics() {
    return state_.orderStatistics;
  },
  getOrderStatisticsSubscribe() {
    return state_.orderStatisticsSubscribe;
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

