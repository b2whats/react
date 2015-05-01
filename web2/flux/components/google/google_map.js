'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var Emitter = require('utils/emitter.js');
var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');

var GoogleMapMap = require('./google_map_map.jsx');
var GoogleMapMarkers = require('./google_map_markers.jsx');

var gmap_loader_ = require('third_party/google_map.js');

var merge = require('utils/merge.js');
var Geo = require('utils/geo.js');
var raf = require('utils/raf.js');

var kEPS = 0.00001;

var kMAP_CONTROL_OPTIONS = {
  overviewMapControl: false,
  streetViewControl: false,
  rotateControl: true,
  mapTypeControl: false,
  //minZoom: 1,
  //maxZoom: 24,
  //TODO add and comment all google options
};

function get_left_top_from_center(width, height, center, zoom) {
  var gs = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  gs.set_view_size(width, height);
  gs.set_view([center[0], center[1]], zoom, 0); //от центральной точки
  return gs.unproject({x: -width / 2, y: -height / 2});
}

function is_arrays_equal_eps(array_a, array_b, eps) {
  if(array_a && array_b) {
    for(var i = 0; i !== array_a.length; ++i) {
      if(Math.abs(array_a[i] - array_b[i]) > eps) {
        return false;
      }
    }
    return true;
  }
  return false;
}


var GoogleMap = React.createClass({  
  mixins: [PureRenderMixin],
  
  propTypes: {
    onCenterChange: PropTypes.func, 
    center: PropTypes.array,
    defaultCenter: PropTypes.array,
    zoom: PropTypes.number.isRequired,
    restrict_bounds: PropTypes.array,
    className: PropTypes.string,
    options: PropTypes.any,
  },


  on_window_resize_ () {
    var map_dom = this.refs.google_map_dom.getDOMNode();    
    this.geo_service_.set_view_size(map_dom.clientWidth, map_dom.clientHeight);
    this.on_bounds_changed_();
  },

  on_bounds_changed_ (map) {
    if(map) {
      var loc_bounds = map.getBounds();
      var ne = loc_bounds.getNorthEast();
      var sw = loc_bounds.getSouthWest();
      this.geo_service_.set_view([ne.lat(), sw.lng()], map.getZoom(), 0);
    }

    if(this.props.onCenterChange && this.geo_service_.can_project()) {
      var top_left = this.geo_service_.unproject({x: 0, y: 0});
      var bottom_right = this.geo_service_.unproject({x: this.geo_service_.get_width(), y: this.geo_service_.get_height()});
      var zoom = this.geo_service_.get_zoom();
      var bounds = [top_left.lat, top_left.lng, bottom_right.lat, bottom_right.lng];
      var center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width() / 2, y: this.geo_service_.get_height() / 2});

      if(!is_arrays_equal_eps(bounds, this.prev_bounds_, kEPS)) {
        this.props.onCenterChange([center_lat_lng.lat, center_lat_lng.lng], bounds, zoom);
        this.prev_bounds_ = bounds;
      }
      
      if(sc.__DEV__) { //TODO remove if all ok
        if(map) {
          var gm_c = map.getCenter();
          if(!is_arrays_equal_eps([center_lat_lng.lat, center_lat_lng.lng], [gm_c.lat(), gm_c.lng()], kEPS)) {
            console.error('cneter', gm_c.lat(), gm_c.lng());
          }
          //compare with google map
          if(!is_arrays_equal_eps(bounds, [ne.lat(), sw.lng(), sw.lat(), ne.lng()], kEPS)) {
            console.error('arrays not equal', '\n', bounds, '\n', [ne.lat(), sw.lng(), sw.lat(), ne.lng()]);
          }
        }
      }
    }
  },

  componentWillMount() {
    var this_ = this;
    this.map_ = null;
    this.prev_bounds_ = null;
    this.prev_center_ = null;

    this.markers_dispatcher_ = merge(Emitter.prototype, {
      get_children() {
        return this_.props.children;
      }
    });
    this.geo_service_ = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  },

  componentDidMount() {
    window.addEventListener('resize', this.on_window_resize_);
    
    setTimeout(() => { //to detect size
      this.on_window_resize_ ();
      
      var br_lat_lng = get_left_top_from_center(this.geo_service_.get_width(), this.geo_service_.get_height(), this.props.center || this.props.defaultCenter, this.props.zoom);      
      this.geo_service_.set_view([br_lat_lng.lat, br_lat_lng.lng], this.props.zoom, 0);
      
      this.on_bounds_changed_(); //now we can calculate map bounds center etc...

      gmap_loader_()
      .then(maps => {
        var center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width() / 2, y: this.geo_service_.get_height() / 2});
        
        var props_options = {
          zoom: this.props.zoom,
          center: new maps.LatLng(center_lat_lng.lat, center_lat_lng.lng),
        };

        var map_options = Object.assign({}, kMAP_CONTROL_OPTIONS, this.props.options || {}, props_options);
              
        var map = new maps.Map(this.refs.google_map_dom.getDOMNode(), map_options);
        this.map_ = map;
        
        //render in overlay
        var this_ = this;
        var overlay = Object.assign(new maps.OverlayView(), {
          onAdd() {
            var div = document.createElement('div');
            this.div = div;
            div.style.backgroundColor = 'transparent';
            div.style.position = 'absolute';
            div.style.left = '0px';
            div.style.right = '0px';
            div.style.width = '100px';
            div.style.height = '100px';
            var panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(div);

            React.render(
              <GoogleMapMarkers geo_service={this_.geo_service_} dispatcher={this_.markers_dispatcher_} />, //ice_main(null)
              div
            );
          },

          draw() {
            var overlayProjection = this.getProjection();
            var bounds = map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var ptx = overlayProjection.fromLatLngToDivPixel(new maps.LatLng(ne.lat(), sw.lng()));
            var div  = this.div;

            raf( () => {
              //div.style.transform = `translate(${ptx.x}px, ${ptx.y}px)`; //bad solution 
              div.style.left = `${ptx.x}px`;
              div.style.top = `${ptx.y}px`;
              if(this_.markers_dispatcher_) {
                this_.markers_dispatcher_.fire(event_names.kON_CHANGE);
              }
            });

            this_.on_bounds_changed_(map, maps);          
          }
        });

        overlay.setMap(map);
        

        maps.event.addListener(map, 'idle', () => {
            var div  = overlay.div;
            var overlayProjection = overlay.getProjection();
            var bounds = map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var ptx = overlayProjection.fromLatLngToDivPixel(new maps.LatLng(ne.lat(), sw.lng()));

            raf( () => {
              div.style.left = `${ptx.x}px`;
              div.style.top  = `${ptx.y}px`;
              if(this_.markers_dispatcher_) {
                this_.markers_dispatcher_.fire(event_names.kON_CHANGE);
              }            
            });

            this_.on_bounds_changed_(map, maps);
        });
      })
      .catch( e => {
        console.error(e);
        throw e;
      });
    }, 0, this);
  },
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.on_window_resize_);
    this.map_ = null;
    this.markers_dispatcher_.destroy();

    delete this.map_;
    delete this.markers_dispatcher_;
  },

  componentWillReceiveProps(next_props) {
    if(this.map_) {
      var center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width() / 2, y: this.geo_service_.get_height() / 2});
      if(next_props.center) {
        if(Math.abs(next_props.center[0] - center_lat_lng.lat) + Math.abs(next_props.center[1] - center_lat_lng.lng) > kEPS) {
          var br_lat_lng = get_left_top_from_center(this.geo_service_.get_width(), this.geo_service_.get_height(), next_props.center, next_props.zoom);
          this.geo_service_.set_view([br_lat_lng.lat, br_lat_lng.lng], next_props.zoom, 0);
          
          var new_center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width() / 2, y: this.geo_service_.get_height() / 2});
          this.map_.panTo({lat: new_center_lat_lng.lat, lng: new_center_lat_lng.lng});
        }
      }

      //if zoom chaged by user
      if(Math.abs(next_props.zoom - this.props.zoom) > 0) {
        this.map_.setZoom(next_props.zoom);
      }
    }
  },

  componentDidUpdate() {
    this.markers_dispatcher_.fire(event_names.kON_CHANGE);
  },

  render () {
    return (
      <div className={this.props.className}>
        <GoogleMapMap ref="google_map_dom"/>
      </div>
    );
  }
});

module.exports = GoogleMap;
