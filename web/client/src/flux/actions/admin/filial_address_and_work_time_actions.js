'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var actions_ = [
  ['f_reset', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_RESET],
  ['f_address_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED],
  ['f_coords_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED],
  ['f_work_time_append', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_APPEND],
  ['f_work_time_remove', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_REMOVE],
  ['f_type_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED],
  ['f_phone_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED],
];

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

