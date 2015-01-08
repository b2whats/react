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

var r_auto_parts_by_id_ = resource(api_refs.kAUTO_PART_BY_ID_API);

var actions_ = [
  ['reset_auto_part_data', event_names.kON_AUTO_PART_BY_ID_RESET_DATA]
];

var query_auto_part_by_id = (region_text, id) => {
  return r_auto_parts_by_id_
    .get({id:id, region_text:region_text})
    .then(res => {
      // обработка результата
      console.log('apart res::: ',res);
      return res;
    });
};

var query_auto_part_by_id_memoized = memoize(query_auto_part_by_id, kMEMOIZE_OPTIONS);

module.exports.query_auto_part_by_id = (region_text, id) => {
  return serializer( () => query_auto_part_by_id_memoized(region_text, id)
    .then(res => {
      
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_AUTO_PART_BY_ID_DATA_LOADED].concat([res]));
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
