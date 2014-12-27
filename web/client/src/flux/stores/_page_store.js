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

var kON_PAGE_CHANGED__PAGE_STORE_PRIORITY =  sc.kON_PAGE_CHANGED__PAGE_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  page_data: {}
});

var page_store_did_change_cncl = main_dispatcher
.on(event_names.kON_PAGE_CHANGED, page_data => {  
  var im_page_data = immutable.fromJS(page_data);
  
  if(!immutable.is(state_.page_data, im_page_data)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
    state_.page_data_cursor
      .update(() => im_page_data);

    page_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
  }
}, kON_PAGE_CHANGED__PAGE_STORE_PRIORITY);


var page_store = merge(Emitter.prototype, {
  get_state_ro () {
    return state_.page_data;
  },

  dispose () {
    page_store_did_change_cncl();
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = page_store;
