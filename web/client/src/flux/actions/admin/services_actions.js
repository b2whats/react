'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');
var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

module.exports.get_services_information = () => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .get({type : 'get'})
    .then(response => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kACCOUNT_SERVICES_INFO_LOADED].concat([response]));
    });
};
module.exports.make_payment = (payment_info) => {
  return resource(api_refs.kACCOUNT_SERVICES_PAYMENT)
    .post(payment_info)
    .then(response => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kACCOUNT_SERVICES_INFO_LOADED].concat([response]));
    });
};
var actions_ = [
  ['change_step', event_names.kACCOUNT_SERVICES_CHANGE_STEP],
  ['toggle', event_names.kACCOUNT_SERVICES_TOGGLE],
  ['change_tarif', event_names.kACCOUNT_SERVICES_CHANGE_TARIF]
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

