'use strict';

var _ = require('underscore');

var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var actions_ = [
  ['test_action', event_names.kON_TEST_VALUE]
];


module.exports = _.extend({}, module.exports, action_export_helper(actions_));
