'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var actions_ = [
  ['show_fixed_tooltip', event_names.kON_TOOLTIP_SHOW],
];

module.exports = _.extend({}, module.exports, action_export_helper(actions_));
