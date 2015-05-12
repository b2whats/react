'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');



var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');


var state_ =  init_state(_.last(__filename.split('/')), {
    toggle: {},
});

var cncl_ = [
  main_dispatcher
    .on(event_names.kCHANGE_GENERAL_TOGGLE, (id) => {
      state_.toggle_cursor
        .update((m) => m.set(id,!!!m.get(id)));
      toggle.fire(event_names.kON_CHANGE);
    }, 1)
];



var toggle = merge(Emitter.prototype, {
    getToggle () {
        return state_.toggle;
    },
    dispose () {

        if(cncl_) {
            _.each(cncl_, cncl => cncl());
        }
        cncl_ = null;
    },
    $assert_info: main_dispatcher.get_assert_info()
});


module.exports = toggle;