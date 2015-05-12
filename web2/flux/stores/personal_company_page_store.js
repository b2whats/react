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
  company_information      : {},
  company_filials          : {},
  comments                 : [],
  new_comment              : {},
  comment_status : null,
  comment_field_validation : {},
  rating: {
    plus: 0,
    minus: 0
  },
});

var cncl_ = [
  main_dispatcher
    .on(event_names.kPERSONAL_COMPANY_INFO_LOADED, info => {
      state_.comments_cursor
        .update(() => immutable.fromJS([]));
      if (!!info['company']) {
        state_.company_information_cursor
          .update(() => immutable.fromJS(info['company']));
      }
      if (!!info['company_filials']) {
        state_.company_filials_cursor
          .update(() => immutable.fromJS(info['company_filials']));
      }
      if (!!info['reviews']) {
        state_.comments_cursor
          .update(() => immutable.fromJS(info['reviews']));
        state_.rating_cursor
          .update((x) => x.set('plus', state_.comments.filter(el => el.getIn(['review', 'rating']) === '+').size));
        state_.rating_cursor
          .update((x) => x.set('minus', state_.comments.filter(el => el.getIn(['review', 'rating']) === '-').size));
      }


      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kSUBMIT_COMMENT_SUCCESS, info => {
        state_.comments_cursor
          .update((x) => x.push(immutable.fromJS(info)));
        state_.new_comment_cursor
          .update((x) => x.clear());
      state_.comment_status_cursor
        .update(() => 'Вы разместили отзыв. После модерации его можно будет посмотреть ниже на этой же странице.');
        state_.rating_cursor
          .update((x) => x.set('plus', state_.comments.filter(el => el.getIn(['review', 'rating']) === '+').size));
        state_.rating_cursor
          .update((x) => x.set('minus', state_.comments.filter(el => el.getIn(['review', 'rating']) === '-').size));
      console.log(state_.new_comment.toJS());
      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kSUBMIT_ANSWER_SUCCESS, (id,info) => {
        state_.comments.find((el,k) => {
          if (el.get('id') == id ) {
            state_.comments_cursor
              .update((x) => x.set(k,immutable.fromJS(info)));
          }
        });


      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.COMMENT_FORM_UPDATE, (name, value)  => {
      state_.new_comment_cursor
        .update(m => m.set(name, value));
      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kSUBMIT_COMMENT_STATUS_ERROR, (response)  => {
      var errors = immutable.fromJS(response.errors);
      var map_error = errors
        .reduce((memo, error) =>
          memo.set(error.get('property'), (memo.get('property') || immutable.List()).push(error)), immutable.Map());
      state_.comment_field_validation_cursor
        .update(() => map_error);
      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kSUBMIT_COMMENT_STATUS_RESET, ()  => {
      state_.comment_status_cursor
        .update(() => null);
      state_.comment_field_validation_cursor
        .update((x) => x.clear());
      company_personal_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
  /*
  main_dispatcher
    .on(event_names.kACCOUNT_COMPANY_FILIALS_LOADED, info => {
      state_.company_filials_cursor
        .update(() => immutable.fromJS(info));
      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kACCOUNT_COMPANY_FILIALS_UPDATE, filial => {

      state_.company_filials_cursor
        .update(m => {
          if (!!state_.company_filials.find(el => el.get('id') === filial.id)) {
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
      account_page_store.fire(event_names.kON_CHANGE);
    }, 1),
  main_dispatcher
    .on(event_names.kON_CURRENT_FILIAL_CHANGE, (id_element)  => {
      console.log('UPDATE 1');
      state_.current_filial_cursor
        .update(() => state_.company_filials.find(b => b.get('id') === id_element));
      //После него идет открытие модального окна, стейт могу не обновлять, он его сам обновит
      //account_page_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kON_FILIAL_DELETE, (id_filial)  => {

      state_.company_filials_cursor
        .update(company_filials => company_filials.filter(b => b.get('id') !== id_filial));
      account_page_actions.delete_company_filial_async(id_filial);
      account_page_store.fire(event_names.kON_CHANGE);
    }, 100000),*/
];

var company_personal_page_store = merge(Emitter.prototype, {
  get_company_information() {
    return state_.company_information;
  },
  getCompanyFilials() {
    return state_.company_filials;
  },
  get_new_comment() {
    return state_.new_comment;
  },
  get_comment_status() {
    return state_.comment_status;
  },
  get_comment_field_validation() {
    return state_.comment_field_validation;
  },
  get_comments() {
    return state_.comments;
  },
  get_rating() {
    return state_.rating;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info : main_dispatcher.get_assert_info()
});

module.exports = company_personal_page_store;