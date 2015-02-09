'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');


var Emitter = require('utils/emitter.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');
var merge = require('utils/merge.js');


var modal_actions = require('actions/modal_actions.js');

var state_ =  init_state(_.last(__filename.split('/')), {
    is_auth: false,
    role: null,
    auth_field_validation: {},
    path: null
});

var cncl_ = [

    main_dispatcher
        .on(event_names.kAUTH_STATUS, (response)  => {
            console.log('ssdfsdfsd', response);
            
            if (!response.valid) {
                var errors = immutable.fromJS(response.errors);
                var map_error = errors
                    .reduce( (memo, error) =>
                        memo.set(error.get('property'), (memo.get('property') || immutable.List()).push(error)), immutable.Map());
                state_.auth_field_validation_cursor
                    .update(() => map_error);
            } else {
                state_.auth_field_validation_cursor
                    .clear();

                state_.is_auth_cursor
                    .update(m => true);

                state_.role_cursor
                    .update(m => response.info.role);
                modal_actions.close_modal();
                console.log('OK!!!!');
            }
            auth_store.fire(event_names.kON_CHANGE);
        },100000), //ВОТ ЭТО БЛЯТЬ ЧТО ТАКОЕ!!!


    main_dispatcher.on(event_names.kAUTH_SAVE_PATH, (path)  => {
        state_.path_cursor
            .update(() => path);
        
        auth_store.fire(event_names.kON_CHANGE);
    }, sc.kAUTH_STORE_PRIORITY),
];



var auth_store = merge(Emitter.prototype, {
    is_auth () {
        return state_.is_auth;
    },
    get_role () {
        return state_.role;
    },
    get_auth_field_validation () {
        return state_.auth_field_validation;
    },
    get_path() {
        return state_.path;
    },
    dispose () {

        if(cncl_) {
            _.each(cncl_, cncl => cncl());
        }
        cncl_ = null;
    },
    $assert_info: main_dispatcher.get_assert_info()
});


module.exports = auth_store;