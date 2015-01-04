
'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var route_actions = require('actions/route_actions.js');
var route_definitions = require('shared_constants/route_names.js');

var text_utils = require('utils/text.js');

var actions_ = [
  ['search_page_size_chaged', event_names.kON_SEARCH_PAGE_SIZE_CHANGED],
  ['search_page_map_visibility_chaged', event_names.kON_SEARCH_PAGE_CHANGE_MAP_VISIBILITY],

  ['search_page_header_rating_star_hover', event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_HOVER],
  ['search_page_header_rating_star_click', event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_CLICK]

];

// find/:region_id/:sentence/:producer/:articul/:id
module.exports.goto_auto_parts_page = (region_id, id, articul, producer, sentence) => {
  route_actions.goto_link_w_params(route_definitions.kROUTE_PARTS_FIND, 
    text_utils.encode_link_object_properties({
      region_id: region_id,
      id: id,
      articul: text_utils.remove_tags(articul), 
      producer: text_utils.remove_tags(producer),
      sentence: text_utils.remove_tags(sentence)
    }));
};

module.exports = _.extend({}, module.exports, action_export_helper(actions_));
