'use strict';

var _ = require('underscore');

var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var actions_ = [
  ['test_action', event_names.kON_TEST_VALUE],
  
  ['test_action_toggle_balloon', event_names.kON_TEST_TOGGLE_BALLOON],
  ['test_action_close_balloon', event_names.kON_TEST_CLOSE_BALLOON],
  ['test_action_show_phone', event_names.kON_TEST_SHOW_PHONE]
  

];


module.exports = _.extend({}, module.exports, action_export_helper(actions_));
