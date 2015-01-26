'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');
var point_utils = require('utils/point_utils.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var state_ =  init_state(_.last(__filename.split('/')), {
  open_id: -1,
  open_type: '' 
});


var kON_FIXED_TOOLTIP__FIXED_TOOLTIP_STORE_PRIORITY =  sc.kON_FIXED_TOOLTIP__FIXED_TOOLTIP_STORE_PRIORITY; //меньше дефолтной


var cncl_ = [
  main_dispatcher
  .on(event_names.kON_TOOLTIP_SHOW, (open_id, open_type) => {
    
    if(state_.open_id === open_id && state_.open_type === open_type) {
      open_id = -1; //close
    }

    state_.open_id_cursor
      .update( () => open_id);

    state_.open_type_cursor
      .update( () => open_type);

    fixed_tooltip_store.fire(event_names.kON_CHANGE);
  }, kON_FIXED_TOOLTIP__FIXED_TOOLTIP_STORE_PRIORITY)
];


var fixed_tooltip_store = merge(Emitter.prototype, {

  get_tooltip_open_id () {
    return state_.open_id;
  },

  get_tooltip_open_type () {
    return state_.open_type;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});

module.exports = fixed_tooltip_store;
