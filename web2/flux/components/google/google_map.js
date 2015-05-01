'use strict';

//var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = require('classnames');

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
  //maxZoom: 24
};

function get_left_top_from_center(width, height, center, zoom) {
  var gs = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  gs.set_view_size(width, height);
  gs.set_view([center[0], center[1]], zoom, 0); //от центральной точки
  return gs.unproject({x: -width / 2, y: -height / 2});
}

function is_arrays_equal_eps(array_a, array_b, eps) {
  for(var i=0;i!=array_a.length;++i) {
    if(Math.abs(array_a[i] - array_b[i]) > eps) {
      return false;
    }
  }
  return true;
}


var GoogleMap = React.createClass({  
  mixins: [PureRenderMixin],
  
  propTypes: {
    on_resize: PropTypes.func,
    on_bounds_changed: PropTypes.func, 
    center: PropTypes.array.isRequired,
    zoom: PropTypes.number.isRequired,
    restrict_bounds: PropTypes.array,
    className: PropTypes.string
  },

  componentWillMount() {
    var this_ = this;

    this.map_ = null;

    this.markers_dispatcher_ = merge(Emitter.prototype, {
      get_children() {
        return this_.props.children;
      }
    });

    this.geo_service_ = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  },


  on_window_resize () {
    var map_dom = this.refs.google_map_dom.getDOMNode();    
    this.geo_service_.set_view_size(map_dom.clientWidth, map_dom.clientHeight);
    //this.props.on_resize && this.props.on_resize(map_dom.clientWidth, map_dom.clientHeight); //jshint ignore:line
  },

  on_bounds_changed (map, maps) {
    if(map) {
      var bounds = map.getBounds();
      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();
      this.geo_service_.set_view([ne.lat(), sw.lng()], map.getZoom(), 0);
    }

    if(this.props.on_bounds_changed) {      
      var top_left = this.geo_service_.unproject({x: 0, y: 0});
      if(map) {
        var proj = map.getProjection();
        var pt = proj.fromPointToLatLng(new maps.Point(0,0));
      }

      var bottom_right = this.geo_service_.unproject({x: this.geo_service_.get_width(), y: this.geo_service_.get_height()});
      var zoom = this.geo_service_.get_zoom();
      var bounds = [top_left.lat, top_left.lng, bottom_right.lat, bottom_right.lng];
      this.props.on_bounds_changed(bounds, zoom);      
      if(map) {
        if(sc.__DEV__) {
          //compare with google map
          if(!is_arrays_equal_eps(bounds, [ne.lat(), sw.lng(), sw.lat(), ne.lng()], kEPS)) {
            console.error('arrays not equal','\n', bounds,'\n',[ne.lat(), sw.lng(), sw.lat(), ne.lng()]);
          }
        }
      }
    }
  },

  componentDidMount() {
    window.addEventListener('resize', this.on_window_resize);
    
    setTimeout(() => { //to detect size
      this.on_window_resize ();
      
      var br_lat_lng = get_left_top_from_center(this.geo_service_.get_width(), this.geo_service_.get_height(), this.props.center, this.props.zoom);      
      this.geo_service_.set_view([br_lat_lng.lat, br_lat_lng.lng], this.props.zoom, 0);
      
      this.on_bounds_changed();


      gmap_loader_()
      .then(maps => {
        console.log('LOADED');
        var center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width() / 2, y: this.geo_service_.get_height() / 2});
        
        var map_options = Object.assign({}, kMAP_CONTROL_OPTIONS, this.props.options);

        var mapOptions = Object.assign({
          zoom: this.props.zoom,
          center: new maps.LatLng(center_lat_lng.lat, center_lat_lng.lng),
        }, map_options);
              
        var map = new maps.Map(this.refs.google_map_dom.getDOMNode(), mapOptions);
        this.map_ = map;

        //не вешать на bounds changed
        //maps.event.addListener(map, 'center_changed', this.check_bounds.bind(this, map, maps));
        //maps.event.addListener(map, 'zoom_changed', this.check_bounds.bind(this, map, maps));

        //----------------------------------------
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
              //div.style.transform = `translate(${ptx.x}px, ${ptx.y}px)`; //чтобы не было глюков с z-index и тп
              div.style.left = `${ptx.x}px`;
              div.style.top = `${ptx.y}px`;
              if(this_.markers_dispatcher_) {
                this_.markers_dispatcher_.fire(event_names.kON_CHANGE);
              }
            });
            this_.on_bounds_changed(map, maps);          
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
            this_.on_bounds_changed(map, maps);
        });
      })
      .catch( e => {
        console.error(e);
        throw e;
        }
      );
    }, 0, this);
  },
  
  check_bounds(map) { //не дать гуглокарте ускакать за пределы разрешенного
    return;
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var center = bounds.getCenter();
    var zoom = map.getZoom();
    
    var lt_lat = this.props.restrict_bounds[0];
    var lt_lng = this.props.restrict_bounds[1];

    var br_lat = this.props.restrict_bounds[2];
    var br_lng = this.props.restrict_bounds[3];

    
    
    if(ne.lat() > lt_lat || sw.lat() < br_lat || 
    (sw.lng() < lt_lng || (sw.lng() > ne.lng() && center.lng() < 0)) ||
    (ne.lng() > br_lng || (sw.lng() > ne.lng() && center.lng() > 0))) {
      var map_width = this.geo_service_.get_width();
      var map_height = this.geo_service_.get_width();

      var geo_service = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);      
      geo_service.set_view_size(map_width, map_height);
      var br_lat_lng;

      if(ne.lat() > lt_lat) {
        geo_service.set_view([lt_lat, sw.lng()], zoom, 0);
        br_lat_lng = geo_service.unproject({x: map_width / 2, y: map_height / 2});
      }

      if(sw.lat() < br_lat) {
        geo_service.set_view([br_lat, sw.lng()], zoom, 0);
        br_lat_lng = geo_service.unproject({x: map_width / 2, y: -map_height / 2});
      }
      
      
      if(sw.lng() < lt_lng || (sw.lng() > ne.lng() && center.lng() < 0)) {        
        geo_service.set_view([ne.lat(), lt_lng], zoom, 0);
        br_lat_lng = geo_service.unproject({x: map_width / 2, y: map_height / 2}); 
      }
      
      if(ne.lng() > br_lng || (sw.lng() > ne.lng() && center.lng() > 0)) {
        geo_service.set_view([ne.lat(), br_lng], zoom, 0);
        br_lat_lng = geo_service.unproject({x: -map_width / 2, y: map_height / 2}); 
      }

      //setTimeout(() => map.setCenter({lat: br_lat_lng.lat, lng: br_lat_lng.lng}), 0);
    }
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.on_window_resize);
    this.map_ = null;
    this.markers_dispatcher_.destroy();

    delete this.map_;
    delete this.markers_dispatcher_;
  },

  componentWillReceiveProps(next_props) {
    if(this.map_) {
      if(Math.abs(next_props.center[0] - this.props.center[0]) + Math.abs(next_props.center[1] - this.props.center[1]) > kEPS) {
        var br_lat_lng = get_left_top_from_center(this.geo_service_.get_width(), this.geo_service_.get_height(), this.props.center, this.props.zoom);        
        this.geo_service_.set_view([br_lat_lng.lat, br_lat_lng.lng], next_props.zoom, 0);
        var center_lat_lng = this.geo_service_.unproject({x: this.geo_service_.get_width()/2, y: this.geo_service_.get_height()/2});        
        this.map_.setCenter({lat:center_lat_lng.lat, lng:center_lat_lng.lng});
      }

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
