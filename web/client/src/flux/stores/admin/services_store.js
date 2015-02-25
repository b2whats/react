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
  step : 3,
  toggle: {
    'autoservices' : 'autoservices'
  },
  brands_by_region: {},
  services_by_type: {},
  select_brands: {},
  select_services: {},
  tarifs: {
    autoparts : {
      '0' : {
        month : 0,
        price : 0,
        discount : 0
      },
      '1' : {
        month : 1,
        price : 300,
        discount : 5
      },
      '3' : {
        month : 3,
        price : 600,
        discount : 10
      },
      '6' : {
        month : 6,
        price : 900,
        discount : 15
      },
    },
    autoservices : {
      '0' : {
        month : 0,
        price : 0,
        discount : 0
      },
      '1' : {
        month : 1,
        price : 300,
        discount : 5
      },
      '3' : {
        month : 3,
        price : 600,
        discount : 10
      },
      '6' : {
        month : 6,
        price : 900,
        discount : 15
      },
    },
    catalog : {
      '0' : {
        month : 0,
        price : 0,
        discount : 0
      },
      '1' : {
        month : 1,
        price : 300,
        discount : 5
      },
      '3' : {
        month : 3,
        price : 600,
        discount : 10
      },
      '6' : {
        month : 6,
        price : 900,
        discount : 15
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
      if (info.payment) {
        state_.payment_cursor
          .update(() => immutable.fromJS(info.payment));
      }
      if (info.brand_region) {
        state_.brands_by_region_cursor
          .update(() => immutable.fromJS(info.brand_region));
        state_.select_brands_cursor
          .update(() => immutable.fromJS(info.brand_id));

        state_.services_by_type_cursor
          .update(() => immutable.fromJS(info.services_type));
        state_.select_services_cursor
          .update(() => immutable.fromJS(info.service_id));
      }
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
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_BRANDS, (id,val) => {
      console.log(id,val);
      if (val) {
        state_.select_brands_cursor
          .update((list) => list.push(id));
      } else {
        var ind = state_.select_brands.indexOf(id);
        state_.select_brands_cursor
          .update((list) => list.splice(ind,1));
      }
      console.log(state_.select_brands.toJS());
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_SERVICES, (id,val) => {
      if (val) {
        state_.select_services_cursor
          .update((list) => list.push(id));
      } else {
        var ind = state_.select_services.indexOf(id);
        state_.select_services_cursor
          .update((list) => list.splice(ind,1));
      }
      console.log(state_.select_services.toJS());
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
  get_brands_by_region() {
    return state_.brands_by_region;
  },
  get_services_by_type() {
    return state_.services_by_type;
  },
  get_select_brands() {
    return state_.select_brands;
  },
  get_select_services() {
    return state_.select_services;
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