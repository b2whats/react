'use strict';

var _ = require('underscore');
var q = require('third_party/es6_promise.js');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var promise_serializer = require('utils/promise_serializer.js');
var memoize = require('utils/promise_memoizer.js');

var serializer = promise_serializer.create_serializer();

var text_util = require('utils/text.js');

//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};

var r_auto_service_by_id_ = resource(api_refs.kAUTO_SERVICE_BY_ID_API);

var actions_ = [
  ['reset_autoservice_data', event_names.kON_AUTO_SERVICE_BY_ID_RESET_DATA]
];

var query_autoservice_by_id = (region_text, id) => {
  return r_auto_service_by_id_
    .get({id:id, region_text:region_text})
    .then(function(res) {
      // обработка результата
      var map_user_id = _.reduce(res.map, (memo,marker) => {
        memo[marker.user_id] = true; 
        return memo
      }, {});
      
      var res_user_id = _.reduce(res.results, (memo,marker) => {
        memo[marker.user_id] = true; 
        return memo
      }, {});      
      
      var markers = _.filter(res.map, m => m.user_id in res_user_id);
      var results = _.filter(res.results, m => m.user_id in map_user_id);

      var res_converted = {header:res.header, markers:markers, results:results};

      console.log('service res::: ',res);
      console.log('service res 2::: ',res);
      return res_converted;
    });
};

var query_autoservice_by_id_memoized = memoize(query_autoservice_by_id, kMEMOIZE_OPTIONS);

module.exports.query_autoservice_by_id = (region_text, id) => {
  return serializer( () => query_autoservice_by_id_memoized(region_text, id)
    .then(res => {
      
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_AUTO_SERVICE_BY_ID_DATA_LOADED].concat([res]));
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

