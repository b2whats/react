'use strict';
//var sc = require('shared_constants');
var event_names = require('shared_constants/event_names.js');

//var merge = require('utils/merge.js');
//var raf = require('utils/raf.js');
var dom_helper = require('utils/dom_helper.js');

var map_start_stop_store = require('stores/map_start_stop_store.js');

var kCLASS_DISABLED = 'disable-pointer-events';




function init() {
  //потом вынести эту логику отсюда
  var scroll = false;
  var last_scroll_time = 0;
  var kDELTA = 250;
  var kEPS_DELTA = kDELTA/10;
  var body_node = dom_helper.query_selector('body');
  
  var run_scroll_on = () => {
    var curr_time = (new Date()).getTime();
    
    if(curr_time - last_scroll_time > kDELTA) {
      scroll = false;
      dom_helper.remove_class(body_node, kCLASS_DISABLED);
    } else {
      setTimeout(run_scroll_on, kDELTA+kEPS_DELTA);
    }
  };


  dom_helper.subscribe_w_capture(body_node, 'wheel', () => {
    last_scroll_time = (new Date()).getTime();
    
    if(!scroll) {
      dom_helper.add_class(body_node, kCLASS_DISABLED);
      scroll = true;
      setTimeout(run_scroll_on, kDELTA+kEPS_DELTA);
    }

  });
  
  map_start_stop_store.on(event_names.kON_CHANGE, () => {
    var events_disabled = map_start_stop_store.get_events_disabled_ro();
    var body_node = dom_helper.query_selector('body');

    if(events_disabled) {
      dom_helper.add_class(body_node, kCLASS_DISABLED);
    } else {
      dom_helper.remove_class(body_node, kCLASS_DISABLED);
    }
  });
}

module.exports.init = init;


