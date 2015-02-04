'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');



var actions_ = [
    ['reset_form', event_names.kON_FORM_RESET],
    ['reset_form_validate', event_names.kON_FORM_RESET_VALIDATE],
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

