'use strict';

var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var r_upload_file = resource(api_refs.kACCOUNT_MANAGE_UPLOAD_FILE);

var actions_ = [
  ['am_reset', event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_RESET],
  ['change_price_property', event_names.kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED],
  ['change_price_list_content', event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_CONTENT_CHANGED],
  ['change_price_type', event_names.kON_ON_ACCOUNT_MANAGE_PRICE_TYPE_CHANGED],
];

module.exports.upload_price_list = (form_data, operation_id, file_name, price_type) => {
  r_upload_file
  .save({operation_id: operation_id, price_type:price_type}, form_data)
  .then((r) => {
    if(r && r.errors && r.errors.length>0) {
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS].concat([r.errors, file_name]));
    } else {
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED].concat([file_name]));
    }
  })
  .catch(e => {
    console.error('upload error', e, e.message);
    var errors = [{message: e.message}];
    main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS].concat([errors, file_name]));
  })
};


module.exports = _.extend({}, module.exports, action_export_helper(actions_));

