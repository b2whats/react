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

var kFAKE_RESULT = require('./test/auto_service_fake_result.json');
var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kAUTOSERVICE_MARKER_TYPE = 'autoservice-marker-type';
var kAUTOSERVICE_HINT = 'автосервис: ';
var kAUTOSERVICE_MARKER_COLOR = sass_vars['autoservice-marker-color'];
var kAUTOSERVICE_CLUSTER_COLOR = sass_vars['cluster-marker-color'];

var kAUTOSERVICE_DELTA_ID = 10000000;

var r_auto_service_by_id_ = resource(api_refs.kAUTO_SERVICE_BY_ID_API);

var actions_ = [
  ['reset_autoservice_data', event_names.kON_AUTO_SERVICE_BY_ID_RESET_DATA],

  ['autoservice_toggle_balloon', event_names.kON_AUTOSERVICE_BY_ID_TOGGLE_BALLOON],
  ['autoservice_close_balloon', event_names.kON_AUTOSERVICE_BY_ID_CLOSE_BALLOON],
  ['autoservice_show_phone', event_names.kON_AUTOSERVICE_BY_ID_SHOW_PHONE],
  ['autoservice_marker_hover', event_names.kON_AUTOSERVICE_BY_ID_MARKER_HOVER],
  
  ['autoservice_balloon_visible', event_names.kON_AUTOSERVICE_BY_ID_BALLOON_VISIBLE],
];

module.exports.close_all_and_open_balloon = (id) => {
  main_dispatcher.fire(event_names.kON_AUTOSERVICE_BY_ID_CLOSE_ALL_BALLOON);
  setTimeout( () => {
    main_dispatcher.fire(event_names.kON_AUTOSERVICE_BY_ID_TOGGLE_BALLOON, id);
  }, 200);
};


var query_autoservice_by_id = (region_text, id) => {
  return r_auto_service_by_id_
    .get({id:id, region_text:region_text})
    .then(function(res) {
      res  = kFAKE_RESULT;

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
        _.extend( {
                    is_open: false,        //true если с этой метки открыт balloon или надо открыть-закрыть балун
                    show_phone: false,     //показывать ли телефон
                    balloon_visible: false //конкретно именно этот balloon открыт на экране, 
                                           //в случае кластера может отличаться от is_open, 
                                           //например открыли балун по одной метке и переместились стрелками в карусели кластер балуна на другой
                                           //наличие этого поля объясняется неимоверной хреновостью yandex map api
                  },
                  {
                    marker_color: kAUTOSERVICE_MARKER_COLOR, //так как цвета маркера задаются в апи явно то вынужден писать их тут а не в css                    
                    marker_type: kAUTOSERVICE_MARKER_TYPE,   //пока не используется, а так это тип метки - автосервис или запчасть
                    hint: kAUTOSERVICE_HINT + m.company_name //что показывать на метке
                  },
                  {
                    cluster_color: kAUTOSERVICE_CLUSTER_COLOR //цвет иконки кластера
                  },
                  m,
                  {
                    server_id:m.id,                   //настоящий id
                    id: m.id + kAUTOSERVICE_DELTA_ID, //смещенный id
                    icon_number: m.rank               //циферка на иконке
                  } ));


      markers = _.sortBy(markers, m => m.rank);


      //поле не забыть доставка 1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"
      var results = _.filter(res.results, m => m.user_id in map_user_id);

      var res_converted = {header:res.header, markers:markers, results:results};
      
      //console.log('service res 2::: ', res_converted);
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

