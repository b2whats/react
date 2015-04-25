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
  masters_name: {},
  tarifs: {
    autoparts : {
      '0' : {
        month : 0,
        price : 0,
        discount : 0
      },
      '1' : {
        month : 1,
        price : 5000,
        discount : 0
      },
      '3' : {
        month : 3,
        price : 14250,
        discount : 5
      },
      '6' : {
        month : 6,
        price : 27000,
        discount : 10
      },
      '12' : {
        month : 12,
        price : 48000,
        discount : 20
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
        price : 7000,
        discount : 0
      },
      '3' : {
        month : 3,
        price : 19950,
        discount : 5
      },
      '6' : {
        month : 6,
        price : 37800,
        discount : 10
      },
      '12' : {
        month : 12,
        price : 67200,
        discount : 20
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
        price : 2500,
        discount : 0
      },
      '3' : {
        month : 3,
        price : 7125,
        discount : 5
      },
      '6' : {
        month : 6,
        price : 13500,
        discount : 10
      },
      '12' : {
        month : 12,
        price : 24000,
        discount : 20
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
  payment_method : [
    {
      name : 'Безналичный банковский перевод',
      img  : '/assets/images/templates/beznal.png',
      type : 'robokassa',
      id   : 'beznal'
    },
    {
      name : 'Банкосвская карта (Visa, MasterCard, Maestro, JCB, BCL)',
      img  : '/assets/images/templates/creditcard.png',
      type : 'robokassa',
      id   : 'creditcard'
    },
    {
      name : 'WebMoney',
      img  : '/assets/images/templates/webmoney.png',
      type : 'robokassa',
      id   : 'webmoney'
    },
    {
      name : 'Яндекс Деньги',
      img  : '/assets/images/templates/yandex.png',
      type : 'robokassa',
      id   : 'yandex'
    },
    {
      name : 'Другие способы (ROBOKASSA)',
      img  : '/assets/images/templates/robokassa.png',
      type : 'robokassa',
      id   : 'yandex'
    },
  ],
  current_payment_method : {}
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

        state_.masters_name_cursor
          .update(() => immutable.fromJS(info.masters_name));
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
    .on(event_names.kACCOUNT_SERVICES_CHANGE_MASTERS_NAME, (names) => {
      state_.masters_name_cursor
        .update((m) => m.set(0,names));
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
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_PAYMENT_METHOD, (id) => {
      state_.current_payment_method_cursor
        .update(() => state_.payment_method.get(id));
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
  get_masters_name() {
    return state_.masters_name;
  },
  get_payment_method() {
    return state_.payment_method;
  },
  get_current_payment_method() {
    return state_.current_payment_method;
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