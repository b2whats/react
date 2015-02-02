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
var modal_actions = require('actions/modal_actions.js');

var state_ =  init_state(_.last(__filename.split('/')), {
    register_field: {
        type: 2,
        email: '',
        password: '',
        company_name: '',
        phone: ''
    },
    register_field_validation: {}

});

var cncl_ = [
    main_dispatcher
        .on(event_names.kON_FORM_UPDATE, (name, value)  => {
            state_.register_field_cursor
                .update(m => m.set(name,value));
            register_store.fire(event_names.kON_CHANGE);
        },100000),
    main_dispatcher
        .on(event_names.kON_FORM_SUBMIT, ()  => {
            state_.register_field_validation_cursor
                .update(() => state_.register_field.filter(b => b === ''));
            if (state_.register_field_validation.size > 0) {
            } else {
                register_actions.submit_register_data(state_.register_field.toJS())
            }
            register_store.fire(event_names.kON_CHANGE);
        },100000),
    main_dispatcher
        .on(event_names.kREGISTER_STATUS, (response)  => {
            if (!response.status) {
                state_.register_field_validation_cursor
                    .update(() => immutable.fromJS(response.status_text));
            } else {
                modal_actions.close_modal();
                console.log('OK!!!!');
            }
            register_store.fire(event_names.kON_CHANGE);
        },100000),
];



var register_store = merge(Emitter.prototype, {
    get_register_field () {
        return state_.register_field;
    },
    get_register_field_validation () {
        return state_.register_field_validation;
    },
    dispose () {

        if(cncl_) {
            _.each(cncl_, cncl => cncl());
        }
        cncl_ = null;
    },
    $assert_info: main_dispatcher.get_assert_info()
});


module.exports = register_store;