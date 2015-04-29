'use strict';
/**
* Карта гугла с отложенной загрузкой
*/
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var sc = require('shared_constants');

/* jshint ignore:start */
var GoogleMap = require('components/google/google_map.js');
var Marker = require('./marker.jsx');
/* jshint ignore:end */

var map_actions = require('actions/map_actions.js');
var plot_actions = require('actions/plot_actions.js');

var hotel_info_actions = require('actions/hotel_info_actions.js');

var markers_store = require('stores/markers_store.js');
var page_google_map_store = require('stores/page_google_map_store.js');


var Geo = require('utils/geo.js');




//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_initial_center: markers_store.get_initial_center (),

  map_initial_zoom: markers_store.get_initial_zoom (),
  selected_aspects: markers_store.get_selected_aspects(),
  markers: markers_store.get_markers(),
  see_the_best_value: page_google_map_store.get_see_the_best_value(),
  thru_the_ice_value: page_google_map_store.get_thru_the_ice_value(),
}),
markers_store, page_google_map_store /*observable store list*/);

var kMIN_ZOOM_SMALL = {
  minZoom: 3
};

var kMIN_ZOOM_BIG = {
  minZoom: 3
};

var MapBlock = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_projection_change (next_state) {
    var state = next_state ? next_state : this.state;

    hotel_info_actions.get_poi_data(
      this.geo_service_.unproject_bounds_with_margin(sc.kMAP_MARKERS_MARGINS, 10000),
      this.geo_service_.get_zoom(),
      state.selected_aspects.toJS(),
      state.see_the_best_value.get('id'),
      state.thru_the_ice_value.get('id')
    );
  },

  on_resize (width, height) {
    map_actions.map_size_changed(width, height); //пока не используется нигде    
    this.geo_service_.set_view_size(width, height); 
    this.geo_service_.can_project() && this.on_projection_change();    
  },

  on_bounds_changed (left_top, zoom) {
    map_actions.map_bounds_changed(left_top, zoom); //пока не используется нигде
    this.geo_service_.set_view(left_top, zoom, 0);
    this.geo_service_.can_project() && this.on_projection_change();    
  },
  
  componentWillUpdate (nextProps, nextState) {
    if(nextState.selected_aspects!==this.state.selected_aspects || 
       nextState.see_the_best_value!==this.state.see_the_best_value || 
       nextState.thru_the_ice_value!==this.state.thru_the_ice_value) {
         
      this.geo_service_.can_project() && this.on_projection_change(nextState);
    
    }
  },

  componentWillMount() {    
    this.geo_service_ = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  },

  componentDidMount() {

    setTimeout( () => {
      var node = this.refs.map_google_holder.getDOMNode();
      this.on_resize(node.clientWidth, node.clientHeight);
    
      var gs = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
      gs.set_view_size(node.clientWidth, node.clientHeight);
      gs.set_view(this.state.map_initial_center.toJS(), this.state.map_initial_zoom, 0); //от центральной точки
      var br_lat_lng = gs.unproject({x: -node.clientWidth/2, y: -node.clientHeight/2});
      //проинициализировать до загрузки карты чтобы можно было подтянуть маркеры
      this.on_bounds_changed([br_lat_lng.lat, br_lat_lng.lng], this.state.map_initial_zoom, 0);

    }, 0, this );

  },

  on_hover(id, hover) {
    plot_actions.marker_hover(id, hover);
  },
  
  on_click(id) {
    plot_actions.favorite_toggle(id);
  },

  render () {
    var Markers = this.state.markers.map ( marker => (
        <Marker 
          on_click={this.on_click} 
          on_hover={this.on_hover} 
          key={marker.get('rid')} 
          lat={marker.get('lat')} 
          lng={marker.get('lng')} 
          marker={marker} />
    )).toJS();

    var options = kMIN_ZOOM_SMALL;
    if(this.geo_service_.get_width() > sc.kMAP_MIN_ZOOM_CHANGE_AT_WIDTH) {
      options = kMIN_ZOOM_BIG;
    }

    /* jshint ignore:start */
    return (
      <div className={this.props.className} ref="map_google_holder">      
        {this.geo_service_.get_width() > 0 && 
          <GoogleMap 
            center={this.state.map_initial_center.toJS()}
            zoom={this.state.map_initial_zoom}
            restrict_bounds={sc.kMAP_RESTRICT_BOUNDS}
            on_resize={this.on_resize}
            on_bounds_changed={this.on_bounds_changed}
            options={options}>
            
            {Markers}
          </GoogleMap>
        }
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = MapBlock;
