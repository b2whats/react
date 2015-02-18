'use strict';

var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var r_set_filial_info_update = resource(api_refs.kACCOUNT_COMPANY_FILIAL_UPDATE);
module.exports.submit_form = (value) => {
	r_set_filial_info_update.post(value)
		.then(data => {
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_FILIALS_UPDATE].concat([data.data]))
		});
};

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

