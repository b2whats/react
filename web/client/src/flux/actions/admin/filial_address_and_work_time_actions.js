'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var actions_ = [
  ['f_reset', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_RESET],
  ['f_address_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED],
  ['f_coords_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED],
  ['f_metadata_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_METADATA_CHANGED],
  ['f_work_holiday_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_HOLIDAY_CHANGED],
  ['f_work_time_from_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_FROM_CHANGED],
  ['f_work_time_to_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_TO_CHANGED],
  ['f_type_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED],
  ['f_phone_change', event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED],
];

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

