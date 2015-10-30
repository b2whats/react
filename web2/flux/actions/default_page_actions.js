
'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var route_actions = require('actions/route_actions.js');
var route_definitions = require('shared_constants/route_names.js');

var text_utils = require('utils/text.js');

var actions_ = [
  ['default_page_size_chaged', event_names.kON_DEFAULT_PAGE_SIZE_CHANGED]
];

// find/:region_id/:sentence/:producer/:articul/:id
module.exports.goto_auto_parts_page = (region_id, id, articul, producer, sentence) => {
  route_actions.goto_link_w_params(route_definitions.kROUTE_PARTS_FIND_NEW,
    text_utils.encode_link_object_properties({
      region_id: region_id,
      id: id,
      articul: text_utils.remove_tags(articul) || '_',
      producer: text_utils.remove_tags(producer) || '_',
      sentence: text_utils.remove_tags(sentence) || '_',
      service: '_',
      service_id: '_',
      service_auto_mark: '_'
    }));
};

module.exports.goto_auto_service_page = (region_id, service_id, service_auto_mark, service) => {
  route_actions.goto_link_w_params(route_definitions.kROUTE_PARTS_FIND_NEW,
    text_utils.encode_link_object_properties({
      region_id: region_id,
      id: '_',
      articul:  '_',
      producer: '_',
      sentence: '_',
      service_id: service_id,
      service: text_utils.remove_tags(service) || '_',
      service_auto_mark: text_utils.remove_tags(service_auto_mark) || '_'      
    }));
};



module.exports = _.extend({}, module.exports, action_export_helper(actions_));
