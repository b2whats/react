'use strict';

//var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var event_names = require('shared_constants/event_names.js');


module.exports.people_answered_scroll_start = function(){
  var args = [].slice.call(arguments);
  args.splice(0,0, event_names.kPEOPLE_ANSWERED_SCROLL_START);
  main_dispatcher.fire.apply(main_dispatcher, args);
};


module.exports.people_answered_menu_will_change = function(){
  var args = [].slice.call(arguments);
  args.splice(0,0, event_names.kPEOPLE_ANSWERED_MENU_WILL_CHANGE);
  main_dispatcher.fire.apply(main_dispatcher, args);
};

module.exports.people_answered_menu_did_change = function(){
  var args = [].slice.call(arguments);
  args.splice(0,0, event_names.kPEOPLE_ANSWERED_MENU_DID_CHANGE);
  main_dispatcher.fire.apply(main_dispatcher, args);
};


