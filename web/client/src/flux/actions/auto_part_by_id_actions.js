'use strict';

var _ = require('underscore');
//var q = require('third_party/es6_promise.js');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var promise_serializer = require('utils/promise_serializer.js');
var memoize = require('utils/promise_memoizer.js');

var serializer = promise_serializer.create_serializer();

//var text_util = require('utils/text.js');

//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};

//var kAUTO_PART_ID_PREFIX = 'ap::'; //на карте одновременно могут быть и сервисы и запчасти и не факт что id не пересекаются
var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kAUTO_PART_MARKER_TYPE = 0;
var kAUTO_PART_HINT = 'автозапчасти: ';
var kAUTO_PART_MARKER_COLOR = sass_vars['auto-part-marker-color'];
var kAUTO_PART_CLUSTER_COLOR = sass_vars['cluster-marker-color'];




var r_auto_parts_by_id_ = resource(api_refs.kAUTO_PART_BY_ID_API);

var actions_ = [
  ['reset_auto_part_data', event_names.kON_AUTO_PART_BY_ID_RESET_DATA],

  ['auto_part_toggle_balloon', event_names.kON_AUTO_PART_BY_ID_TOGGLE_BALLOON],
  ['auto_part_close_balloon', event_names.kON_AUTO_PART_BY_ID_CLOSE_BALLOON],
  ['auto_part_show_phone', event_names.kON_AUTO_PART_BY_ID_SHOW_PHONE],
  ['auto_part_marker_hover', event_names.kON_AUTO_PART_BY_ID_MARKER_HOVER]  
];

var query_auto_part_by_id = (region_text, id) => {
  return r_auto_parts_by_id_
    .get({id:id, region_text:region_text})
    .then(res => {      
      //чистим данные с сервера
      var map_user_id = _.reduce(res.map, (memo,marker) => {
        memo[marker.user_id] = true; 
        return memo;
      }, {});
      
      var res_user_id = _.reduce(res.results, (memo,marker) => {
        memo[marker.user_id] = true; 
        return memo;
      }, {});      
      
      var markers = _.filter(res.map, m => m.user_id in res_user_id);
      
      markers = _.map(markers, (m, m_index) => 
        _.extend( {is_open: false, show_phone: false}, //system
                  {marker_color: kAUTO_PART_MARKER_COLOR, marker_z_index: m.rank, marker_base_z_index: m.rank , marker_type: kAUTO_PART_MARKER_TYPE, hint: kAUTO_PART_HINT + m.company_name}, //брать потом из базы
                  {cluster_color: kAUTO_PART_CLUSTER_COLOR},
                  m,
                  {server_id:m.id, id: m.id, icon_number:m.rank } ));


      markers = _.sortBy(markers, m => m.rank);


      //поле не забыть доставка 1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"
      var results = _.filter(res.results, m => m.user_id in map_user_id);

      var res_converted = {header:res.header, markers:markers, results:results};

      //console.log('apart res::: ',res);
      console.log('apart res 2::: ', res_converted);
      return res_converted;
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
