'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');

var account_page_actions = require('actions/account_page_actions.js');

var state_ = init_state(_.last(__filename.split('/')), {
  company_information     : {
    legal_detail: null,
    phone: null,
  },
  companyFilials         : [],
  current_filial          : {},
  company_personal_detail : {}
});

var cncl_ = [
  main_dispatcher
    .on(event_names.kACCOUNT_COMPANY_INFO_LOADED, info => {

      state_.company_information_cursor
        .update(() => immutable.fromJS(info[0]));
      if (!!info[0].legal_detail) {
        state_.company_personal_detail_cursor
          .update(() => immutable.fromJS(info[0].legal_detail));
      }
      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_COMPANY_FILIALS_LOADED, info => {
      state_.companyFilials_cursor
        .update(() => immutable.fromJS(info));
      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_COMPANY_FILIALS_UPDATE, filial => {

      state_.companyFilials_cursor
        .update(m => {
          if (!!state_.companyFilials.find(el => el.get('id') === filial.id)) {
            return m.map(el => (el.get('id') === filial.id) ? immutable.fromJS(filial) : el);
          }
          else {
            return m.push(immutable.fromJS(filial));
          }
        });

      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kON_COMPANY_PERSONAL_DETAILS_UPDATE, (field, value) => {
      state_.company_personal_detail_cursor
        .update(m => m.set(field, value));
      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kON_FORM_UPDATE, (name, value)  => {
      state_.company_information_cursor
        .update(m => m.set(name, value));
      //account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kON_CURRENT_FILIAL_CHANGE, (id_element)  => {
      // console.log('UPDATE 1');
      state_.current_filial_cursor
        .update(() => state_.companyFilials.find(b => b.get('id') === id_element));
      //После него идет открытие модального окна, стейт могу не обновлять, он его сам обновит
      //account_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kON_FILIAL_DELETE, (id_filial)  => {

      state_.companyFilials_cursor
        .update(companyFilials => companyFilials.filter(b => b.get('id') !== id_filial));
      account_page_actions.delete_company_filial_async(id_filial);
      account_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
];

var account_page_store = merge(Emitter.prototype, {
  get_company_information() {
    return state_.company_information;
  },
  getCompanyFilials() {
    return state_.companyFilials;
  },
  get_current_filial() {
    return state_.current_filial;
  },
  get_company_personal_detail() {
    return state_.company_personal_detail;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info : main_dispatcher.get_assert_info()
});

module.exports = account_page_store;