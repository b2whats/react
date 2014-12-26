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

var kON_DEFAULT_PAGE_SIZE_CHANGED__DEFAULT_PAGE_SIZE_STORE_PRIORITY =  sc.kON_DEFAULT_PAGE_SIZE_CHANGED__DEFAULT_PAGE_SIZE_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  width: 0
});

var default_page_size_store_did_change_cncl = main_dispatcher
.on(event_names.kON_DEFAULT_PAGE_SIZE_CHANGED, width => {  
  var im_width = immutable.fromJS(width);

  if(!immutable.is(state_.width, width)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
    state_.width_cursor
      .update(() => im_width);
    
    default_page_size_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
  }
}, kON_DEFAULT_PAGE_SIZE_CHANGED__DEFAULT_PAGE_SIZE_STORE_PRIORITY);


var default_page_size_store = merge(Emitter.prototype, {
  get_width () {
    return state_.width;
  },

  dispose () {
    default_page_size_store_did_change_cncl();
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = default_page_size_store;
