'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

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
  ['change_region_selection_visibility', event_names.kON_CHANGE_REGION_SELECTION]
];


var get_regions_memoized = memoize(() => 
  r_regions_.get()
  .then(region_list => {
    region_list = _.map(region_list, r => {
      var res = _.extend({}, r);
      res.title = r.center;
      return res;
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
    if(promise_serializer.is_skip_error) {
      //console.log('SKIPPED')
    } else {
      console.error(e, e.stack);
      throw e;
    }
  });
};


module.exports.goto_region = (region_id) => {
  route_actions.goto_link_w_params(route_definitions.kROUTE_DEF_W_REGION, {region_id: region_id});
};

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

