'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var routes_store = require('stores/routes_store.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var route_definitions = require('shared_constants/route_names.js');
var route_actions = require('actions/route_actions.js');

var promise_serializer = require('utils/promise_serializer.js');
var serializer = promise_serializer.create_serializer();

var memoize = require('utils/promise_memoizer.js');
//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};

var r_regions_ = resource(api_refs.kREGIONS_QUERY_API);

var actions_ = [
  ['change_region_selection_visibility', event_names.kON_CHANGE_REGION_SELECTION],
];


var convert_lat_lng_string_2_array = (str) => {
  return _.map(str.split(','), v => 1*v);
};

var get_regions_memoized = memoize(() => 
  r_regions_.get()
  .then(region_list => {

    region_list = _.map(region_list, r => {
      var res = _.extend({}, r);
      res.title = r.name; //для тайпахеда
      res.center = convert_lat_lng_string_2_array(res.center);
      res.lower_corner = convert_lat_lng_string_2_array(res.lower_corner);
      res.upper_corner = convert_lat_lng_string_2_array(res.upper_corner);
      return res;
    });
    var map = ymaps;
      map.ready(() => {

        map.geolocation.get({
        provider: 'yandex',
        mapStateAutoApply: true
      }).then(function (result) {
        var region = result.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName.toLocaleLowerCase();
        if (region == 'Северо-Западный федеральный округ'.toLocaleLowerCase()) {
          region = 'Санкт-петербург';
        } else if(region == 'Центральный федеральный округ'.toLocaleLowerCase()) {
          region = 'москва';
        }
        var translate = region_list.filter(el => el.name.toLocaleLowerCase() == region.toLocaleLowerCase());
        console.log(translate);
        module.exports.region_changed(region);
        module.exports.goto_region(translate[0]['translit_name']);
      });

    });

    main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_REGION_LIST_LOADED].concat([region_list]));
    return region_list;
  })
, kMEMOIZE_OPTIONS);


//----------------------------------------------------------------------------------------------------------
//exports section
//----------------------------------------------------------------------------------------------------------
module.exports.region_changed = (region_id) => {  //подгружает список регионов если надо
  return serializer( () => get_regions_memoized() //для смены региона надо быть уверенным что они загружены
    .then(region_list => {      
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_REGION_CHANGED].concat([region_id]));
      return region_list;
    })
  )
  .catch(e => {
    if(promise_serializer.is_skip_error(e)) {
      //console.log('SKIPPED')
    } else {
      console.error(e, e.stack);
      throw e;
    }
  });
};


//тут пример что мы подменяем один из параметров в текущем роуте а не меняем существующий
module.exports.goto_region = (region_id) => {
  var route_params = routes_store.get_route_context_params() && routes_store.get_route_context_params().toJS();
  var route_defaults = routes_store.get_route_state_ro();
  //если стоит пустой роут / то выбрать роут с проставленым region_id
  route_defaults = (route_defaults === route_definitions.kROUTE_DEF) ? route_definitions.kROUTE_DEF_W_REGION : route_defaults;
  route_actions.goto_link_w_params(route_defaults, _.extend({}, route_params, {region_id: region_id}));
};

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

