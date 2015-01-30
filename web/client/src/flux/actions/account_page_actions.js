'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
var r_get_company_info = resource(api_refs.kACCOUNT_COMPANY_INFO);
module.exports.get_company_information = (company_id) => {
    return r_get_company_info.get({company_id: company_id})
        .then(response => {
            main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_INFO_LOADED].concat([response]));
        });
};
var r_set_company_info = resource(api_refs.kACCOUNT_COMPANY_INFO_UPDATE);
module.exports.update_company_information = (new_company_information) => {
    r_set_company_info.post(new_company_information)
        .then(data => {
            return data;
        });
};
var actions_ = [
    ['update_form', event_names.kON_FORM_UPDATE],
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

