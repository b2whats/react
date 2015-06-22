'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');

var Emitter = require('utils/emitter.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');
var merge = require('utils/merge.js');

var modal_actions = require('actions/ModalActions.js');

var state_ = init_state(_.last(__filename.split('/')), {
  is_auth               : false,
  role                  : null,
  auth_field_validation : {},
  change_password_validation : {},
  path                  : null,
  email                 : null,
  check_done            : false,
  user_id : null,
});

var cncl_ = [
  main_dispatcher
    .on(event_names.kON_FORM_RESET_VALIDATE, ()  => {
      state_.auth_field_validation_cursor
        .clear();
    }, 100000),
  main_dispatcher
    .on(event_names.kAUTH_STATUS_ERROR, (response)  => {
      var errors = immutable.fromJS(response.errors);
      var map_error = errors
        .reduce((memo, error) =>
          memo.set(error.get('property'), (memo.get('property') || immutable.List()).push(error)), immutable.Map());
      state_.auth_field_validation_cursor
        .update(() => map_error);

      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kAUTH_STATUS_SUCCESS, (response)  => {
      state_.change_password_validation_cursor
        .clear();

      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kCHANGE_PASSWORD_ERROR, (response)  => {
      var errors = immutable.fromJS(response.errors);
      var map_error = errors
        .reduce((memo, error) =>
          memo.set(error.get('property'), (memo.get('property') || immutable.List()).push(error)), immutable.Map());
      state_.change_password_validation_cursor
        .update(() => map_error);

      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kAUTH_STATUS_SUCCESS, (response)  => {
      //console.log('auth_success', response);
      state_.auth_field_validation_cursor
        .clear();
      state_.is_auth_cursor
        .update(m => true);
      state_.role_cursor
        .update(m => response.role);
      state_.email_cursor
        .update(m => response.user_email);
      state_.user_id_cursor
        .update(m => response.user_id);
      modal_actions.closeModal();
      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kAUTH_STATUS_RESET, ()  => {
      state_.auth_field_validation_cursor
        .clear();
      state_.is_auth_cursor
        .update(m => false);
      state_.user_id_cursor
        .update(m => null);
      state_.role_cursor
        .update(m => null);
      state_.email_cursor
        .update(m => null);
      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kAUTH_STATUS_CHECK_DONE, ()  => {
      state_.check_done_cursor
        .update(m => true);
      auth_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher.on(event_names.kAUTH_SAVE_PATH, (path)  => {
    state_.path_cursor
      .update(() => path);

    auth_store.fire(event_names.kON_CHANGE);
  }, sc.kAUTH_STORE_PRIORITY),
];

var auth_store = merge(Emitter.prototype, {
  is_auth() {
    return state_.is_auth;
  },
  get_role() {
    return state_.role;
  },
  get_auth_field_validation() {
    return state_.auth_field_validation;
  },
  get_path() {
    return state_.path;
  },
  get_email() {
    return state_.email;
  },
  get_user_id() {
    return state_.user_id;
  },
  get_check_done() {
    return state_.check_done;
  },
  get_change_password_validation() {
    return state_.change_password_validation;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info : main_dispatcher.get_assert_info()
});

module.exports = auth_store;