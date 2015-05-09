const _ = require('underscore');

const mainDispatcher = require('dispatchers/main_dispatcher.js');

const eventNames = require('shared_constants/event_names.js');
const apiRefs = require('shared_constants/api_refs.js');

const resource = require('utils/resource.js');
const actionExportHelper = require('utils/action_export_helper.js');

const serialize = require('utils/promise_serializer_new.js');

// const memoize = require('utils/promise_memoizer.js');
const memoize = require('utils/promise_memoizer_new.js');


// 15 минут експирация, хэш ключей 256, в случае коллизии хранить результатов не более 4 значений по хэш ключу
const K_MEMOIZE_OPTIONS = {expire_ms: 60 * 15 * 1000, cache_size_power: 8, max_items_per_hash: 4};

const K_CATALOG_DELTA_ID = [0, 10000000]; // на случай если id сервисов и филиалов пересекаюца
const K_CATALOG_MARKER_TYPE = ['auto-part-marker-type', 'autoservice-marker-type'];

const rCatalogData = resource(apiRefs.kCATALOG_DATA);

const actions_ = [
  ['mapBoundsChange', eventNames.K_ON_CATALOG_NEW_MAP_BOUNDS_CHANGE],
  ['visibleRowsChange', eventNames.K_ON_CATALOG_VISIBLE_ROWS_CHANGED],
  ['rowHover', eventNames.K_ON_CATALOG_ROW_HOVER]
  /*
  ['reset_catalog_data', eventNames.kON_CATALOG_RESET_DATA],
  ['catalog_toggle_balloon', eventNames.kON_CATALOG_TOGGLE_BALLOON],
  ['catalog_close_balloon', eventNames.kON_CATALOG_CLOSE_BALLOON],
  ['catalog_show_phone', eventNames.kON_CATALOG_SHOW_PHONE],
  ['catalog_marker_hover', eventNames.kON_CATALOG_MARKER_HOVER],
  ['catalog_balloon_visible', eventNames.kON_CATALOG_BALLOON_VISIBLE],
  ['catalog_map_bounds_changed_by_user', eventNames.kON_CATALOG_MAP_BOUNDS_CHANGED_BY_USER],
  ['catalog_change_items_per_page', eventNames.kON_CATALOG_CHANGE_ITEMS_PER_PAGE],
  ['catalog_change_page', eventNames.kON_CATALOG_CHANGE_PAGE],
  ['catalog_search', eventNames.kON_CATALOG_SEARCH],
  ['catalog_show_all_phones_on_current_page', eventNames.kON_CATALOG_SHOW_ALL_PHONES_ON_CURRENT_PAGE],
  */
];

const _queryCatalogData = serialize(memoize(K_MEMOIZE_OPTIONS)((type, brands, services, regionText, priceType) => {
  return rCatalogData.get({
      type: type==='_' ? '' : type,
      brands: brands==='_' ? '' : brands.join(','),
      services: services==='_' ? '': services.join(','),
      region_text: regionText,
      price_type: priceType
    })
    .then(res => {
      if ((Array.isArray(res) && res.length === 0) || res === null) {
        return [];
      }
      // добавить адреса в компании и подчистить компании без адресов и адреса без компаний
      const mapUserId2Markers = _.reduce(res.map, (memo, marker) => {
        if (!(marker.user_id in memo)) {
          memo[marker.user_id] = [];
        }
        memo[marker.user_id].push(marker);
        return memo;
      }, {});

      const resUserId = _.reduce(res.results, (memo, result) => {
        memo[result.user_id] = true;
        return memo;
      }, {});

      const markers = res.map
        .filter(m => m.user_id in resUserId)
        .map(m => Object.assign({}, m, {
            server_id: m.id,    // настоящий id
            id: m.id + K_CATALOG_DELTA_ID[m.filial_type_id - 1],          // смещенный id
            icon_number: m.rank, // циферка на иконке
            marker_type: K_CATALOG_MARKER_TYPE[m.filial_type_id - 1]   // тип метки - автосервис или запчасть
          }));

      // пока задать детерминированную сортировку
      const hashCode = function calcHashCode(str) {
        let hash = 0;
        let i;
        let chr;
        let len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };


      const results = res.results
        .filter(result => result.user_id in mapUserId2Markers)
        .map(result => Object.assign({sort: hashCode(result.company_name) & 0xF}, result, {addresses: mapUserId2Markers[result.user_id]}));

      // console.log(results[0]);
      return results;
    });
}));

module.exports.queryCatalogData = (type, brands, services, regionText, priceType) => {
  return _queryCatalogData(type, brands, services, regionText, priceType)
    .then(res => {
      mainDispatcher.fire.apply(mainDispatcher, [eventNames.K_ON_CATALOG_NEW_DATA_LOADED].concat([res]));
      return res;
    })
    .catch(e => {
      if (!serialize.is_skip_error(e)) {
        console.error(e, e.stack); // eslint-disable-line no-console
        throw e;
      }
    });
};

module.exports = _.extend({}, module.exports, actionExportHelper(actions_));


/* итого имеем

results === [{
  "user_id": 358,
  "company_name": "Автозапчасти в Жулебино",
  "site": null,
  "description": "Автозапчасти для иномарок и отечественных автомобилей (в наличии и на заказ)",
  "filial_type_id": 1,
  "filial_type_name": "Автозапчасти",
  "rank": 330,
  "brand_id": "{560,563,511,583,537,1289,522,599,510,530,549,552,555,573,574,576,871,501,508,550,558,570,572,584,2676,2677,2839,521}",
  "service_id": null,
  "main_phone": "+7(925)868-10-73",
  "filial_phones": [
    "+7(925)868-10-73"
  ],

  "price_type_id": null,
  "sort_payment": 0,
  "sort_time": 0,

  "recommended": {
    "plus": 0,
    "minus": 0
  },

  "addresses": [
  {
    "user_id": 358,
    "id": 522,
    "company_name": "Автозапчасти в Жулебино",
    "phone": null,
    "address": " ",
    "filial_type_id": 1,
    "filial_type_name": "Автозапчасти",
    "coordinates": [
      55.697780952568,
      37.824134575393
    ],
    "region_id": 1,
    "region_name": "Москва",
    "region_number": 77,
    "rank": 330,
    "operation_time": [
    {
      "is_holiday": false,
      "from": "09:00",
      "to": "18:00"
    },
    {
      "is_holiday": false,
      "from": "09:00",
      "to": "18:00"
    },
    {
      "is_holiday": false,
      "from": "09:00",
      "to": "18:00"
    }
    ],
    "main_phone": "+7(925)868-10-73",
    "filial_phones": [
    "+7(925)868-10-73"
    ],
    "price_type_id": null,
    "sort_payment": 0,
    "sort_time": 0
  }
 ]
}, ...]
*/
