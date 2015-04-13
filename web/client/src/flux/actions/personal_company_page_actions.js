'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var promise_serializer = require('utils/promise_serializer.js');
var serializer = promise_serializer.create_serializer();

var memoize = require('utils/promise_memoizer.js');
//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
module.exports.get_company_information = memoize((id) => {
  return resource(api_refs.GET)
    .post({company_by_id: id, company_filials_by_company_id: id})
    .then(response => {
      response['status'] && main_dispatcher.fire.apply (main_dispatcher, [event_names.kPERSONAL_COMPANY_INFO_LOADED].concat([response['results']]));
      response['error'] && console.warn(response['error']);
    });
}, kMEMOIZE_OPTIONS);




var actions_ = [
  ['update_form', event_names.COMMENT_FORM_UPDATE]
];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

