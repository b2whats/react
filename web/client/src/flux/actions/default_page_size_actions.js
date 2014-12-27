
'use strict';

var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');


var actions_ = [
  ['default_page_size_chaged', event_names.kON_DEFAULT_PAGE_SIZE_CHANGED]
];

module.exports =  action_export_helper(actions_);
