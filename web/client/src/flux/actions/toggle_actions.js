'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');



var actions_ = [
    ['change', event_names.kCHANGE_GENERAL_TOGGLE]
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

