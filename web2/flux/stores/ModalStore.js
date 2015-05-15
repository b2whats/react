'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');


var state_ =  init_state(_.last(__filename.split('/')), {
    modalIsOpen: {}
});
var cncl_ = [
    main_dispatcher
        .on(event_names.kON_MODAL_SHOW, (id)  => {
            state_.modalIsOpen_cursor
                .update(m => m.set(id,true));
            modal_store.fire(event_names.kON_CHANGE);
        },100000),
    main_dispatcher
        .on(event_names.kON_MODAL_HIDE, ()  => {
            state_.modalIsOpen_cursor
                .clear();
            modal_store.fire(event_names.kON_CHANGE);
        },100000),
];



var modal_store = merge(Emitter.prototype, {
    getModalIsOpen () {
        return state_.modalIsOpen;
    },
    dispose () {

        if(cncl_) {
            _.each(cncl_, cncl => cncl());
        }
        cncl_ = null;
    },
    $assert_info: main_dispatcher.get_assert_info()
});


module.exports = modal_store;