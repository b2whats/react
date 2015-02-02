'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
//var r_get_company_info = resource(api_refs.kACCOUNT_COMPANY_INFO);
//module.exports.get_company_information = (company_id) => {
//    return r_get_company_info.get({company_id: company_id})
//        .then(response => {
//
//            main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_INFO_LOADED].concat([response]));
//        });
//};
//var r_get_company_filial = resource(api_refs.kACCOUNT_COMPANY_FILIAL);
//module.exports.get_company_filial = (company_id) => {
//    return r_get_company_filial.get({company_id: company_id})
//        .then(response => {
//            main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_FILIALS_LOADED].concat([response]));
//        });
//};
var r_register = resource(api_refs.kSUBMIT_REGISTER_DATA);
module.exports.submit_register_data = (register_data) => {
    r_register.post(register_data)
        .then(response => {
            main_dispatcher.fire.apply (main_dispatcher, [event_names.kREGISTER_STATUS].concat([response]));
        });
};
var actions_ = [
    ['update_form', event_names.kON_FORM_UPDATE],
    ['submit_form', event_names.kON_FORM_SUBMIT],
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

