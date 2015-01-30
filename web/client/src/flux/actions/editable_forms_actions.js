'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');


var actions_ = [
    ['start_edit', event_names.kON_FORM_START_EDIT],
    ['end_edit', event_names.kON_FORM_END_EDIT],
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

