'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kAUTO_PART_MARKER_COLOR = sass_vars['auto-part-marker-color'];
var kAUTO_PART_MARKER_COLOR_HILITE_MAIN = sass_vars['auto-part-marker-color-hilite-main'];
var kAUTO_PART_MARKER_COLOR_HILITE_SECONDARY = 'red';//sass_vars['auto-part-marker-color-hilite-secondary'];

var kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY =  sc.kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  auto_part_data: null
});

var z_index_ = 2000;

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_DATA_LOADED, (auto_part_data) => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(auto_part_data));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_RESET_DATA, () => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(null));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),


  //---------------------------------------------------------------------  
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_TOGGLE_BALLOON, id => { 
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.auto_part_data_cursor
    .cursor(['markers'])
    .update(markers => 
      markers.map(marker => 
        marker.get('id') === id ? 
          marker.set('is_open', !marker.get('is_open')) : 
          (marker.get('is_open') === false ? marker : marker.set('is_open', false)) ));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CLOSE_BALLOON, id => {
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.auto_part_data_cursor    
      .cursor(['markers', index])
      .update(marker => marker.set('is_open', false));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  

  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_SHOW_PHONE, id => { 
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.auto_part_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('show_phone', true));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_MARKER_HOVER, (id, hover_state) => { 
    if(!state_.auto_part_data) return;
    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;
    
    var color = kAUTO_PART_MARKER_COLOR;
    var secondary_color = kAUTO_PART_MARKER_COLOR;
    var marker_main = state_.auto_part_data.get('markers').get(index);
    var rank = marker_main.get('rank');
    var z_index = null;

    if(hover_state) {
      color = kAUTO_PART_MARKER_COLOR_HILITE_MAIN;
      secondary_color = kAUTO_PART_MARKER_COLOR_HILITE_SECONDARY;
      z_index = 500;
    }

    state_.auto_part_data_cursor
      .cursor(['markers'])
      .update( markers => 
        markers.map( (marker, m_index) => 
          marker.get('rank') === rank ? 
            marker.set('marker_color', secondary_color).set('marker_z_index', z_index>0 ? z_index : marker.get('marker_base_z_index') ) : 
            marker ));

    state_.auto_part_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('marker_color', color));
    //rank: 1

    
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY)
];

var auto_part_by_id_store = merge(Emitter.prototype, {
  get_auto_part_data_header () {
    return state_.auto_part_data && state_.auto_part_data.get('header');
  },

  get_auto_part_markers () {
    return state_.auto_part_data && state_.auto_part_data.get('markers');
  },


  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = auto_part_by_id_store;

