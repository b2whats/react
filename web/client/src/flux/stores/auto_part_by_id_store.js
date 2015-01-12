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

var kAUTO_PART_CLUSTER_COLOR = sass_vars['cluster-marker-color'];
var kAUTO_PART_CLUSTER_COLOR_HILITE_MAIN = sass_vars['cluster-marker-color-hilite-main'];


var kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY =  sc.kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  auto_part_data: null,
  results_sorted: null,
  map_center: null
});

var sort_results_ = (results, center) => {
  //пока затычка 
  console.log('resort'); 
  return results;  
};


var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_DATA_LOADED, (auto_part_data) => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(auto_part_data));


    var user_id_2_markers_list = state_.auto_part_data.get('markers').reduce( (r, m) => {
      var marker_user_id = m.get('user_id');
      if(r.get(marker_user_id) === undefined) r = r.set(marker_user_id, immutable.List([]));
      r = r.updateIn([marker_user_id], list => list.push(m));
      return r;
    }, immutable.fromJS({}));
  

    state_.results_sorted_cursor
    .update( () => 
      state_.auto_part_data.get('results')
        .map( r => 
          r.set('markers', user_id_2_markers_list.get(r.get('user_id')))
           .set('main_marker', user_id_2_markers_list.get(r.get('user_id')).get(0)) ));

    if(state_.map_center !== null) {
      state_.results_sorted_cursor
        .update( () => sort_results_(state_.results_sorted, state_.map_center));
    }

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_RESET_DATA, () => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(null));

    state_.results_sorted_cursor
      .update(() => immutable.fromJS(null));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CLOSE_ALL_BALLOON, () => { 
    if(!state_.auto_part_data) return;
    
    state_.auto_part_data_cursor
    .cursor(['markers'])
    .update(markers => markers.map(marker => marker.set('is_open', false)));
  
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  //---------------------------------------------------------------------  
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_TOGGLE_BALLOON, id => { 
    if(!state_.auto_part_data) return;

    if(_.isArray(id)) { //кликнули в кластер - потом разрулю что с этим делать
      var ids = id;
      id = id[0];
    }

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

    if(_.isArray(id)) { //закрыли кластер
      var ids = id;
      id = id[0];
    }


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


    state_.results_sorted_cursor
      .update( results => 
        results.map( result => {
          if(result.get('main_marker').get('id') === id) {            
            result = result.updateIn(['main_marker'], marker =>  marker.set('show_phone', true));          
          }          
          return result;
        } ) );


    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),


  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_BALLOON_VISIBLE, (id, visible) => { 
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.auto_part_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('balloon_visible', visible));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_MARKER_HOVER, (id, hover_state, options) => { 
    if(!state_.auto_part_data) return;

    if(_.isArray(id)) {
      var ids = id;
      id = id[0];
    }

    

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;
    
    var color = kAUTO_PART_MARKER_COLOR;
    var cluster_color = kAUTO_PART_CLUSTER_COLOR;

    var marker_rank = state_.auto_part_data.get('markers').get(index).get('rank');
    
    if(hover_state) {
      color = kAUTO_PART_MARKER_COLOR_HILITE_MAIN;
      cluster_color = kAUTO_PART_CLUSTER_COLOR_HILITE_MAIN;
    }

    state_.auto_part_data_cursor
      .cursor(['markers'])
        .update(markers => 
          markers.map( marker => 
            marker.get('rank') === marker_rank ?
              marker.set('marker_color', color).set('cluster_color', cluster_color) :
              marker             
          ));

    state_.results_sorted_cursor
      .update( results => 
        results.map( result => {
          
          if(result.get('rank') === marker_rank) {
            result = result.set('is_hovered_same_rank', hover_state);
          }
          
          if ( !(options && options.update_same_address === false) ) {
            if(result.get('main_marker').get('id') === id) {
              result = result.set('is_hovered_same_address', hover_state);
            }
          }

          return result;
        } ) );
    
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  

  //------------------RESULTS PART------------------------------------------------------
  //------------------------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_MAP_BOUNDS_CHANGED_BY_USER, (center, zoom) => { 
    
    state_.map_center_cursor
      .update(() => center);
    
    if(!state_.results_sorted) return;

    state_.results_sorted_cursor
      .update( () => sort_results_(state_.results_sorted, state_.map_center));
    
  
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

];

var auto_part_by_id_store = merge(Emitter.prototype, {
  get_auto_part_data_header () {
    return state_.auto_part_data && state_.auto_part_data.get('header');
  },

  get_auto_part_markers () {
    return state_.auto_part_data && state_.auto_part_data.get('markers');
  },

  get_auto_part_results () {
    return state_.results_sorted;
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

