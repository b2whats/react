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

var kAUTOSERVICE_MARKER_COLOR = sass_vars['autoservice-marker-color'];
var kAUTOSERVICE_MARKER_COLOR_HILITE_MAIN = sass_vars['autoservice-marker-color-hilite-main'];
var kAUTOSERVICE_MARKER_COLOR_HILITE_SECONDARY = 'red';//sass_vars['autoservice-marker-color-hilite-secondary'];

var kAUTOSERVICE_CLUSTER_COLOR = sass_vars['cluster-marker-color'];
var kAUTOSERVICE_CLUSTER_COLOR_HILITE_MAIN = sass_vars['cluster-marker-color-hilite-main'];


var kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY =  sc.kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  autoservice_data: null
});

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_BY_ID_DATA_LOADED, (autoservice_data) => {  

    state_.autoservice_data_cursor
      .update(() => immutable.fromJS(autoservice_data));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_BY_ID_RESET_DATA, () => {  

    state_.autoservice_data_cursor
      .update(() => immutable.fromJS(null));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_CLOSE_ALL_BALLOON, id => { 
    if(!state_.autoservice_data) return;
    
    state_.autoservice_data_cursor
    .cursor(['markers'])
    .update(markers => markers.map(marker => marker.set('is_open', false)));
  
    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  //---------------------------------------------------------------------  
  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_TOGGLE_BALLOON, id => { 
    if(!state_.autoservice_data) return;

    if(_.isArray(id)) { //кликнули в кластер - потом разрулю что с этим делать
      var ids = id;
      id = id[0];
    }

    var index  = state_.autoservice_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.autoservice_data_cursor
    .cursor(['markers'])
    .update(markers => 
      markers.map(marker => 
        marker.get('id') === id ? 
          marker.set('is_open', !marker.get('is_open')) : 
          (marker.get('is_open') === false ? marker : marker.set('is_open', false)) ));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),
  
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_CLOSE_BALLOON, id => {
    if(!state_.autoservice_data) return;

    if(_.isArray(id)) { //закрыли кластер
      var ids = id;
      id = id[0];
    }


    var index  = state_.autoservice_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.autoservice_data_cursor    
      .cursor(['markers', index])
      .update(marker => marker.set('is_open', false));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),
  

  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_SHOW_PHONE, id => { 
    if(!state_.autoservice_data) return;

    var index  = state_.autoservice_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.autoservice_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('show_phone', true));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_BALLOON_VISIBLE, (id, visible) => { 
    if(!state_.autoservice_data) return;

    var index  = state_.autoservice_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.autoservice_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('balloon_visible', visible));

    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY),

  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTOSERVICE_BY_ID_MARKER_HOVER, (id, hover_state) => { 
    if(!state_.autoservice_data) return;

    if(_.isArray(id)) {
      var ids = id;
      id = id[0];
    }

    

    var index  = state_.autoservice_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;
    
    var color = kAUTOSERVICE_MARKER_COLOR;
    var cluster_color = kAUTOSERVICE_CLUSTER_COLOR;

    var marker_rank = state_.autoservice_data.get('markers').get(index).get('rank');


    if(hover_state) {
      color = kAUTOSERVICE_MARKER_COLOR_HILITE_MAIN;
      cluster_color = kAUTOSERVICE_CLUSTER_COLOR_HILITE_MAIN;
    }

  
    state_.autoservice_data_cursor
      .cursor(['markers'])
        .update(markers => 
          markers.map( marker => 
            marker.get('rank') === marker_rank ?
              marker.set('marker_color', color).set('cluster_color', cluster_color) :
              marker             
          ));
  
    
    autoservice_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_BY_ID__AUTO_SERVICE_BY_ID_STORE_PRIORITY)

];

var autoservice_by_id_store = merge(Emitter.prototype, {
  get_autoservice_data_header () {
    return state_.autoservice_data && state_.autoservice_data.get('header');
  },

  get_autoservice_markers () {
    return state_.autoservice_data && state_.autoservice_data.get('markers');
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = autoservice_by_id_store;

