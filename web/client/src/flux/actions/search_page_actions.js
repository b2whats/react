'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');

var routes_store = require('stores/routes_store.js');

var route_actions = require('actions/route_actions.js');

var route_names = require('shared_constants/route_names.js');

//var route_definitions = require('shared_constants/route_names.js');

var text_utils = require('utils/text.js');

var actions_ = [
  ['search_page_size_chaged', event_names.kON_SEARCH_PAGE_SIZE_CHANGED],
  ['search_page_map_visibility_chaged', event_names.kON_SEARCH_PAGE_CHANGE_MAP_VISIBILITY],

  ['search_page_header_rating_star_hover', event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_HOVER],
  ['search_page_header_rating_star_click', event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_CLICK]

];

// find/:region_id/:sentence/:producer/:articul/:id
module.exports.goto_auto_parts_page = (id, articul, producer, sentence) => {
  var route_params = routes_store.get_route_context_params() && routes_store.get_route_context_params().toJS();
  var route_defaults = route_names.kROUTE_PARTS_FIND;

  //перенести эту логику в роут актионс если все нормально
  route_actions.goto_link_w_params(route_defaults, _.extend(
    {id:'_', articul:'_', producer:'_', sentence:'_', service_id:'_', service:'_', service_auto_mark:'_'},
    route_params,
    text_utils.encode_link_object_properties({
      id: id,
      articul: text_utils.remove_tags(articul) || '_',
      producer: text_utils.remove_tags(producer) || '_',
      sentence: text_utils.remove_tags(sentence) || '_',
      service_id: 'all',
      service: 'all',
      service_auto_mark: 'all'
    })));
};

module.exports.goto_auto_service_page = (service_id, service_auto_mark, service) => {
  var route_params = routes_store.get_route_context_params() && routes_store.get_route_context_params().toJS();
  var route_defaults = route_names.kROUTE_PARTS_FIND;

  route_actions.goto_link_w_params(route_defaults, _.extend(
    {id:'_', articul:'_', producer:'_', sentence:'_', service_id:'_', service:'_', service_auto_mark:'_'},
    route_params,
    text_utils.encode_link_object_properties({
      service_id: service_id,
      service: text_utils.remove_tags(service) || '_',
      service_auto_mark: text_utils.remove_tags(service_auto_mark) || '_'      
    })));
};


module.exports = _.extend({}, module.exports, action_export_helper(actions_));
