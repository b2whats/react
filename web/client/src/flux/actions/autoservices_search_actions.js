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
var memoize = require('utils/promise_memoizer.js');

var text_util = require('utils/text.js');

//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};


//var r_suggestions_ = resource('/api/suggest/:words');
var r_suggestions_ = resource(api_refs.kAUTO_SERVICE_SUGGESTER_API);
//cors настройки для nginx тут http://enable-cors.org/server_nginx.html

var actions_ = [
  ['value_changed', event_names.kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED],
  ['search_term_changed', event_names.kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED],
  ['show_value_changed', event_names.kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED]
];


var query_service = (words) => {
  if((''+ (words || '')).trim().length < 1) {    
    return (new q(resolve => resolve([])));
  } else {
    return r_suggestions_
    .get({words:words})
    .then(function(sugg_list) {
      var replacer = text_util.create_selection_replacer(words);
      return _.map(sugg_list,  x => [x.id, replacer(x.name), replacer(x.service)]);
    })
  }
};

var query_service_memoized = memoize(query_service, kMEMOIZE_OPTIONS);


module.exports.suggest = function(words, list_state) {  
  serializer( () => query_service_memoized(words)
    .then(res => {
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED].concat([res, list_state]));
      return res;
    })
  )
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
