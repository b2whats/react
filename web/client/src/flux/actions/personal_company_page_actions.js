'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
module.exports.get_company_information = (id) => {
  console.log(123);
  return resource(api_refs.kPERSONAL_COMPANY_PAGE_INFO)
    .post({id : id})
    .then(response => {
      console.log(response);
      //main_dispatcher.fire.apply (main_dispatcher, [event_names.kACCOUNT_COMPANY_INFO_LOADED].concat([response]));
    });
};

var actions_ = [];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

