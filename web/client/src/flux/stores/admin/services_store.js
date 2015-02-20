'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');


var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');

var account_services_actions = require('actions/admin/services_actions.js');


var state_ =  init_state(_.last(__filename.split('/')), {
  payment: {},
  step : 0,
  toggle: {},
  tarifs: {
    autoparts : {
      '0' : {
        month : 0,
        price : 0
      },
      '1' : {
        month : 1,
        price : 300
      },
      '3' : {
        month : 3,
        price : 600
      },
      '6' : {
        month : 6,
        price : 900
      },
    },
    autoservices : {
      '0' : {
        month : 0,
        price : 0
      },
      '1' : {
        month : 1,
        price : 300
      },
      '3' : {
        month : 3,
        price : 600
      },
      '6' : {
        month : 6,
        price : 900
      },
    },
    catalog : {
      '0' : {
        month : 0,
        price : 0
      },
      '1' : {
        month : 1,
        price : 300
      },
      '3' : {
        month : 3,
        price : 600
      },
      '6' : {
        month : 6,
        price : 900
      },
    }
  },
  selected_services: {
    autoparts : {
      month : 0,
      price : 0
    },
    autoservices : {
      month : 0,
      price : 0
    },
    catalog : {
      month : 0,
      price : 0
    }
  },
});

var cncl_ = [
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_INFO_LOADED, info => {
      state_.payment_cursor
        .update(() => immutable.fromJS(info.payment));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_STEP, () => {
      state_.step_cursor
        .update((m) => m+1);
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_TOGGLE, (id) => {
      state_.toggle_cursor
        .update((m) => m.set(id,!!!m.get(id)));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_TARIF, (id,val) => {
      state_.selected_services_cursor
        .cursor([id])
        .update(() => state_.tarifs.get(id).find((v,k) => k == val));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
];

var account_services_store = merge(Emitter.prototype, {
  get_services_info() {
    return state_.payment;
  },
  get_step() {
    return state_.step;
  },
  get_toggle() {
    return state_.toggle;
  },
  get_selected_services() {
    return state_.selected_services;
  },
  get_tarifs() {
    return state_.tarifs;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info : main_dispatcher.get_assert_info()
});


module.exports = account_services_store;