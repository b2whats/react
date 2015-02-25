'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var merge = require('utils/merge.js');
var validator = require('revalidator');

var route_actions = require('actions/route_actions.js');
var region_store = require('stores/region_store.js');
/*var r_register = resource(api_refs.kSUBMIT_REGISTER_DATA);
module.exports.submit_register_data = (register_data) => {
		r_register.post(register_data)
				.then(response => {
						main_dispatcher.fire.apply (main_dispatcher, [event_names.kREGISTER_STATUS].concat([response]));
				});
};*/
var user_shema = {
	email    : {
		required : true,
		format   : 'email',
		messages : {
			      format : 'Не верный Email адрес'
		}
	},
	password : {
		required   : true,
		allowEmpty : false
	},
	type     : {
		required   : true,
		allowEmpty : false
	},
};
var company_shema = {
	phone        : {
		required   : true,
		allowEmpty : false
	},
	company_name : {
		required   : true,
		allowEmpty : false
	},
};

var r_register = resource(api_refs.kSUBMIT_REGISTER_DATA);
module.exports.submit_form = (register_data) => {
	var shema = {
		properties : (register_data.type == 1) ? user_shema : merge(company_shema, user_shema),
	};
	var validation = validator.validate(register_data, shema);
	if (validation.valid) {
		r_register
			.post(register_data)
			.then(response => {
				if (!response.valid) {
					main_dispatcher.fire.apply(main_dispatcher, [event_names.kREGISTER_STATUS_ERROR].concat([response]));
				}
				else {
					main_dispatcher.fire.apply(main_dispatcher, [event_names.kREGISTER_STATUS_SUCCESS]);
					main_dispatcher.fire.apply(main_dispatcher, [event_names.kAUTH_STATUS_SUCCESS].concat([response]));
          route_actions.goto_link_with_default_params('/account/:region_id/company',
            {region_id: region_store.get_region_current().get('translit_name')}
          );
				}
			});
	}
	else {
		main_dispatcher.fire.apply(main_dispatcher, [event_names.kREGISTER_STATUS_ERROR].concat([validation]));
	}
};
var actions_ = [
	[
		'update_form',
		event_names.kON_FORM_UPDATE
	],
	[
		'reset_form_validate',
		event_names.kON_FORM_RESET_VALIDATE
	]
];

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

