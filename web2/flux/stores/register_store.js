'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');

var register_actions = require('actions/register_actions.js');
var modal_actions = require('actions/ModalActions.js');

var state_ = init_state(_.last(__filename.split('/')), {
  register_field            : {
    type : 2
  },
  register_field_validation : {}

});
var route_actions = require('actions/route_actions.js');

var cncl_ = [
  main_dispatcher
    .on(event_names.kON_FORM_UPDATE, (name, value)  => {
      state_.register_field_cursor
        .update(m => m.set(name, value));
      register_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kON_FORM_RESET_VALIDATE, ()  => {
      state_.register_field_validation_cursor
        .clear();
    }, 100000),
  main_dispatcher
    .on(event_names.kREGISTER_STATUS_ERROR, (response)  => {
      var errors = immutable.fromJS(response.errors);
      var map_error = errors
        .reduce((memo, error) =>
          memo.set(error.get('property'), (memo.get('property') || immutable.List()).push(error)), immutable.Map());
      state_.register_field_validation_cursor
        .update(() => map_error);
      register_store.fire(event_names.kON_CHANGE);
    }, 100000),
  main_dispatcher
    .on(event_names.kREGISTER_STATUS_SUCCESS, ()  => {
      state_.register_field_validation_cursor.clear();
    }, 100000),
];

var register_store = merge(Emitter.prototype, {
  get_register_field() {
    return state_.register_field;
  },
  get_register_field_validation() {
    return state_.register_field_validation;
  },
  dispose() {

    if (cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info : main_dispatcher.get_assert_info()
});

module.exports = register_store;