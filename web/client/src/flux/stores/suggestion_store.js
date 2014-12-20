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

var kON_SUGGESTION_DATA_LOADED__SUGGESTIONS_STORE_PRIORITY =  sc.kON_SUGGESTION_DATA_LOADED__SUGGESTIONS_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  suggestion_list: []
});

var suggestion_store_data_change_cncl = main_dispatcher
.on(event_names.kON_SUGGESTION_DATA_LOADED, (suggestion_list) => {  
  
  state_.suggestion_list_cursor
  .update(() => immutable.fromJS(suggestion_list));
  
  suggestion_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были 
}, kON_SUGGESTION_DATA_LOADED__SUGGESTIONS_STORE_PRIORITY);


var suggestion_store = merge(Emitter.prototype, {
  get_suggestion_list () {
    return state_.suggestion_list;
  },

  dispose () {
    suggestion_store_data_change_cncl();
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = suggestion_store;