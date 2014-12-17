'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var kON_DATA_CHANGED__WORK_VIEW_STORE_PRIORITY =  sc.kON_DATA_CHANGED__WORK_VIEW_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  id_2_checked: {}
});

var work_view_store_did_change_cncl = main_dispatcher
.on(event_names.kON_WORK_FEATURE_CHECKED, (id, checked) => {  
  state_.id_2_checked_cursor.update(dict => checked && dict.set(id, true) || dict.remove(id) );

  work_view_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были 
}, kON_DATA_CHANGED__WORK_VIEW_STORE_PRIORITY);


var work_view_store = merge(Emitter.prototype, {
  get_id_2_checked () {
    return state_.id_2_checked;
  },

  dispose () {
    work_view_store_did_change_cncl();
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = work_view_store;
