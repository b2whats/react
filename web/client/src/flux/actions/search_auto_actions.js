'use strict';

var _ = require('underscore');
var q = require('third_party/es6_promise.js');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
var promise_serializer = require('utils/promise_serializer.js');

var serializer = promise_serializer.create_serializer();

//var r_suggestions_ = resource('/api/suggest/:words');
var r_suggestions_ = resource(api_refs.kAUTO_PART_SUGGESTER_API);
//cors настройки для nginx тут http://enable-cors.org/server_nginx.html

var actions_ = [
  ['value_changed', event_names.kON_AUTO_PART_SUGGESTION_VALUE_CHANGED],
  ['search_term_changed', event_names.kON_AUTO_PART_SUGGESTION_SEARCH_TERM_CHANGED],
  ['show_value_changed', event_names.kON_AUTO_PART_SUGGESTION_SHOW_VALUE_CHANGED]
];

module.exports.suggest = function(words, list_state) {  
  serializer( () => {  
    if((''+ (words || '')).trim().length < 1) {    
      return (new q(resolve => resolve([])))
      .then(res => {
        main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_AUTO_PART_SUGGESTION_DATA_LOADED].concat([res, list_state]));
        return res;
      });
    } else {
      return r_suggestions_
      .get({words:words})
      .then(function(sugg_list) {
        return _.map(sugg_list,  x => [x.id, x.code, x.manufacturer, x.name]);
      })
      .then(res => {
        main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_AUTO_PART_SUGGESTION_DATA_LOADED].concat([res, list_state]));
        return res;
      });
    }
  })
  .catch(e => {
    if(promise_serializer.is_skip_error) {
      //console.log('SKIPPED')
    } else {
      console.error(e, e.stack);
      throw e;
    }
  });
};


module.exports = _.extend({}, module.exports, action_export_helper(actions_));
