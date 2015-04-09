'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
module.exports.get_company_information = () => {
    return resource(api_refs.kACCOUNT_COMPANY_INFO).get()
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
var r_get_company_filial = resource(api_refs.kACCOUNT_COMPANY_FILIAL);
module.exports.get_company_filial = () => {
    return r_get_company_filial.get()
        .then(response => {
            main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_FILIALS_LOADED].concat([response]));
        });
};
var r_delete_company_filial = resource(api_refs.kACCOUNT_COMPANY_FILIAL_DELETE);
module.exports.delete_company_filial_async = (filial_id) => {
    console.log('delete', filial_id);
    return r_delete_company_filial.post({filial_id: filial_id});
};

module.exports.submit_company_personal_details = (detail) => {

  resource(api_refs.kACCOUNT_COMPANY_PERSONAL_DETAILS)
    .post({type : 'set', legal_detail: detail})
    .then(data => {
      console.log(data);
    });
};
var actions_ = [
    ['update_form', event_names.kON_FORM_UPDATE],
    ['change_current_filial', event_names.kON_CURRENT_FILIAL_CHANGE],
    ['new_filial', event_names.kON_NEW_FILIAL],
    ['delete_filial', event_names.kON_FILIAL_DELETE],
    ['update_company_personal_details', event_names.kON_COMPANY_PERSONAL_DETAILS_UPDATE],

];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

