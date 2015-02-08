'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var merge = require('utils/merge.js');
var validator = require('revalidator');


var auth_shema =  {
    email: {
        required: true,
        format: 'email',
        messages: {
            format: 'Не верный Email адрес'
        }
    },
    password : {
        required: true,
        allowEmpty: false
    },

};


var r_register = resource(api_refs.kAUTH);
module.exports.submit_form = (auth_data) => {
    var shema = {
        properties: auth_shema,
    };
    var validation = validator.validate(auth_data,shema);
    if (validation.valid) {
        r_register.post(auth_data)
            .then(response => {
                main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_SUCCESS].concat([response]));
            });
    } else {
        main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_ERROR].concat([validation]));
    }
};
var actions_ = [
    ['reset_form_validate', event_names.kON_FORM_RESET_VALIDATE],
    ['save_path', event_names.kAUTH_SAVE_PATH]
];
module.exports = _.extend({}, module.exports, action_export_helper(actions_));

