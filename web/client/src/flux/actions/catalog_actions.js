'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');
var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');
var promise_serializer = require('utils/promise_serializer.js');
var q = require('third_party/es6_promise.js');

var serializer = promise_serializer.create_serializer();

var memoize = require('utils/promise_memoizer.js');
//15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 8, max_items_per_hash: 4};

var r_services_ = resource(api_refs.kCATALOG_SERVICES);
var r_brands_ = resource(api_refs.kCATALOG_BRANDS);
var r_data_ = resource(api_refs.kCATALOG_DATA);


var actions_ = [
  ['append_brand_tag', event_names.kON_CATALOG_APPEND_BRAND_TAG],
  ['remove_brand_tag', event_names.kON_CATALOG_REMOVE_BRAND_TAG],
  
  ['append_service_tag', event_names.kON_CATALOG_APPEND_SERVICE_TAG],
  ['remove_service_tag', event_names.kON_CATALOG_REMOVE_SERVICE_TAG]
];


var convert_lat_lng_string_2_array = (str) => {
  return _.map(str.split(','), v => 1*v);
};

var get_services_memoized = memoize(() => 
  r_services_.get()
  .then(services => {
    return _.map(services, s => _.extend(
      {title: s.name},
      s
    ));
  })
, kMEMOIZE_OPTIONS);

var get_brands_memoized = memoize(() => 
  r_brands_.get()
  .then(brands => {
    return _.map(brands, b => _.extend(
      {title: b.name},
      b
    ));
  })
, kMEMOIZE_OPTIONS);

var get_catalog_data_memoized = memoize((type, brands, services, region_text) => 
  r_data_.get({
    type:type,
    brands: brands && brands.join(',') || '', 
    services: services && services.join(',') || '', 
    region_text: region_text
  })
  .then(data => {          
    return data;
  })
, kMEMOIZE_OPTIONS);


//----------------------------------------------------------------------------------------------------------
//exports section
//----------------------------------------------------------------------------------------------------------
module.exports.get_services_and_brands = (company_type, brands, services) => {  //подгружает список регионов если надо
  return q.all([serializer( () => get_services_memoized()), serializer( () => get_brands_memoized())]) //для смены региона надо быть уверенным что они загружены
    .then(list => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_CATALOG_SERVICES_DATA_LOADED].concat([list[0]]));
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_CATALOG_BRANDS_DATA_LOADED].concat([list[1]]));
      
      company_type = (company_type === '_') ? 2 : +company_type;
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_CATALOG_PARAMS_CHANGED].concat([company_type, brands, services]));
      

      return list;
    })
    .catch(e => {
      if(promise_serializer.is_skip_error(e)) {
        //console.log('SKIPPED')
      } else {
        console.error(e, e.stack);
        throw e;
      }
    });
};
module.exports = _.extend({}, module.exports, action_export_helper(actions_));

