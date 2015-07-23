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

var state_ = init_state(_.last(__filename.split('/')), {
  payment: {},
  step: 3,
  toggle: {
    'autoservices': 'autoservices'
  },
  brands_by_region: [],
  services_by_type: {},
  select_brands: {},
  select_services: {},
  masters_name: [],
  subscribeWords: [],
  subscribeWordsChecked: [],
  subscribeMarkup: [0,0,0,0,0],
  orderType: 0,
  isDiscount: false,
  tarifs: {
    autoparts: {
      '0': {
        month: 0,
        price: 0,
        discount: 0
      },
      '1': {
        month: 1,
        price: 7000,
        discount: 0
      },
      '3': {
        month: 3,
        price: 19950,
        discount: 5
      },
      '6': {
        month: 6,
        price: 37800,
        discount: 10
      }
    },
    autoservices: {
      '0': {
        month: 0,
        price: 0,
        discount: 0
      },
      '1': {
        month: 1,
        price: 7000,
        discount: 0
      },
      '3': {
        month: 3,
        price: 19950,
        discount: 5
      },
      '6': {
        month: 6,
        price: 37800,
        discount: 10
      }
    },
    catalog: {
      '0': {
        month: 0,
        price: 0,
        discount: 0
      },
      '1': {
        month: 1,
        price: 6000,
        discount: 0
      },
      '3': {
        month: 3,
        price: 17100,
        discount: 5
      },
      '6': {
        month: 6,
        price: 32400,
        discount: 10
      }
    },
    subscribe: {
      '0': {
        month: 0,
        price: 0,
        discount: 0
      },
      '1': {
        month: 1,
        price: 0,
        discount: 0
      },
      '3': {
        month: 3,
        price: 0,
        discount: 5
      },
      '6': {
        month: 6,
        price: 0,
        discount: 10
      }
    },
    wholesale: {
      '0': {
        month: 0,
        price: 0,
        discount: 0
      },
      '1': {
        month: 1,
        price: 15000,
        discount: 0
      },
      '3': {
        month: 3,
        price: 42750,
        discount: 5
      },
      '6': {
        month: 6,
        price: 81000,
        discount: 10
      }
    },
  },

  selected_services: {
    autoparts: {
      month: 1,
      price: 7000
    },
    autoservices: {
      month: 1,
      price: 7000
    },
    catalog: {
      month: 1,
      price: 6000
    },
    subscribe: {
      month: 0,
      price: 0,
      words: []
    },
    wholesale: {
      month: 1,
      price: 8000
    },
  },
  payment_method: [
    {
      name: 'Безналичный банковский перевод',
      img: '/assets/images/templates/beznal.png',
      type: 'robokassa',
      id: 'beznal'
    },
    {
      name: 'Банкосвская карта (Visa, MasterCard, Maestro, JCB, BCL)',
      img: '/assets/images/templates/creditcard.png',
      type: 'robokassa',
      id: 'creditcard'
    },
    {
      name: 'WebMoney',
      img: '/assets/images/templates/webmoney.png',
      type: 'robokassa',
      id: 'webmoney'
    },
    {
      name: 'Яндекс Деньги',
      img: '/assets/images/templates/yandex.png',
      type: 'robokassa',
      id: 'yandex'
    },
    {
      name: 'Другие способы (ROBOKASSA)',
      img: '/assets/images/templates/robokassa.png',
      type: 'robokassa',
      id: 'all'
    },
  ],
  current_payment_method: {}
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
        state_.subscribeWords_cursor
          .update(() => immutable.fromJS(info.subscribe_words));
        if (info.subscribe_info) {
          info.subscribe_info.subscribe_words && state_.subscribeWordsChecked_cursor
            .update(() => immutable.fromJS(info.subscribe_info.subscribe_words));
          info.subscribe_info.markup && state_.subscribeMarkup_cursor
            .update(() => immutable.fromJS(info.subscribe_info.markup));
        }
        state_.orderType_cursor
          .update(() => immutable.fromJS(info.payment.order_type));
      }
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),

  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_STEP, () => {
      state_.step_cursor
        .update((m) => m + 1);
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.IS_DISCOUNT_CHANGE, (check) => {
      console.log(check);// eslint-disable-line no-console
      state_.isDiscount_cursor
        .update(() => check);
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_STEP, () => {
      state_.step_cursor
        .update((m) => m + 1);
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_TOGGLE, (id) => {
      state_.toggle_cursor
        .update((m) => m.set(id, !!!m.get(id)));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_TARIF, (id, val) => {
      state_.selected_services_cursor
        .cursor([id])
        .update(() => {
          let tarifs = state_.tarifs.get(id).find((v, k) => k == val);
          return tarifs;
        });
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_MASTERS_NAME, (names) => {
      state_.masters_name_cursor
        .update((m) => m.set(0, names));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_MARKUP, (index, val) => {
      console.log(index, val);// eslint-disable-line no-console
      state_.subscribeMarkup_cursor
        .update((m) => m.set(index, Number(val)));
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_BRANDS, (id, val) => {
      // console.log(id,val);
      if (val) {
        state_.select_brands_cursor
          .update((list) => list.push(id));
      } else {
        var ind = state_.select_brands.indexOf(id);
        state_.select_brands_cursor
          .update((list) => list.splice(ind, 1));
      }
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_SERVICES, (id, val) => {
      if (val) {
        state_.select_services_cursor
          .update((list) => list.push(id));
      } else {
        var ind = state_.select_services.indexOf(id);
        state_.select_services_cursor
          .update((list) => list.splice(ind, 1));
      }
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_WORDS, (index, val) => {
      const id = Number(index);
      if (val) {
        if (id === 9999) {
          state_.subscribeWordsChecked_cursor
            .update((list) => list.clear().push(id));
        } else {
          state_.subscribeWordsChecked_cursor
            .update((list) => list.push(id));
        }
      } else {
        const ind = state_.subscribeWordsChecked.indexOf(id);
        state_.subscribeWordsChecked_cursor
          .update((list) => list.splice(ind, 1));
      }
      console.log(state_.subscribeWordsChecked.toJS());// eslint-disable-line no-console
      account_services_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_PAYMENT_METHOD, (id) => {
      state_.current_payment_method_cursor
        .update(() => state_.payment_method.get(id));
      account_services_store.fire(event_names.kON_CHANGE);

    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_SERVICES_CHANGE_ORDER_TYPE, (type) => {
      state_.orderType_cursor
        .update(() => type);
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
  getToggle() {
    return state_.toggle;
  },
  getSelectedServices() {
    return state_.selected_services;
  },
  getTarifs() {
    return state_.tarifs;
  },
  getBrandsGroupByRegion() {
    return state_.brands_by_region;
  },
  getServicesGroupByType() {
    return state_.services_by_type;
  },
  getSelectBrands() {
    return state_.select_brands;
  },
  getSubscribeMarkup() {
    return state_.subscribeMarkup;
  },
  getSubscribeWords() {
    return state_.subscribeWords;
  },
  getSubscribeWordsChecked() {
    return state_.subscribeWordsChecked;
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
  getOrderType() {
    return state_.orderType;
  },
  getDiscount() {
    return state_.isDiscount;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});

module.exports = account_services_store;