import React, {PropTypes, Component} from 'react/addons';

const {PureRenderMixin} = React.addons;

import Emitter from 'utils/emitter.js';
import sc from 'shared_constants';

import GoogleMapMap from './google_map_map.jsx';
import GoogleMapMarkers from './google_map_markers.jsx';

import gmapLoader from 'third_party/google_map.js';

import merge from 'utils/merge.js';
import Geo from 'utils/geo.js';
import raf from 'utils/raf.js';

let __internalCounter__ = 0;

const kEPS = 0.00001;

const K_MAP_CONTROL_OPTIONS = {
  overviewMapControl: false,
  streetViewControl: false,
  rotateControl: true,
  mapTypeControl: false
  // minZoom: 1,
  // maxZoom: 24,
  // TODO add and comment all google options
};

function getLeftTopFromCenter(width, height, center, zoom) {
  let gs = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  gs.set_view_size(width, height);
  gs.set_view([center[0], center[1]], zoom, 0); // от центральной точки
  return gs.unproject({x: -width / 2, y: -height / 2});
}

function isArraysEqualEps(arrayA, arrayB, eps) {
  if (arrayA && arrayB) {
    for (let i = 0; i !== arrayA.length; ++i) {
      if (Math.abs(arrayA[i] - arrayB[i]) > eps) {
        return false;
      }
    }
    return true;
  }
  return false;
}


const GoogleMap = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onCenterChange: PropTypes.func,
    center: PropTypes.array,
    defaultCenter: PropTypes.array,
    zoom: PropTypes.number.isRequired,
    restrict_bounds: PropTypes.array,
    className: PropTypes.string,
    options: PropTypes.any,
    distanceToMouse: PropTypes.func,
    onChildMouseEnter: PropTypes.func,
    onChildMouseLeave: PropTypes.func,
    hoverDistance: PropTypes.number
  },

  getDefaultProps() {
    return {
      distanceToMouse(pt, mousePos /*, markerProps*/) {
        const x = pt.x;
        const y = pt.y - 20;
        return Math.sqrt((x - mousePos.x) * (x - mousePos.x) + (y - mousePos.y) * (y - mousePos.y));
      },
      hoverDistance: 30
    };
  },

  onChildMouseEnter_(...args) {
    if (this.props.onChildMouseEnter) {
      return this.props.onChildMouseEnter(...args);
    }
  },

  onChildMouseLeave_(...args) {
    if (this.props.onChildMouseLeave) {
      return this.props.onChildMouseLeave(...args);
    }
  },

  onWindowResize_() {
    const mapDom = this.refs.google_map_dom.getDOMNode();
    this.geoService_.set_view_size(mapDom.clientWidth, mapDom.clientHeight);
    this.onBoundsChanged_();
  },

  onBoundsChanged_(map) {
    if (map) {
      const locBounds = map.getBounds();
      const ne = locBounds.getNorthEast();
      const sw = locBounds.getSouthWest();
      this.geoService_.set_view([ne.lat(), sw.lng()], map.getZoom(), 0);
    }

    if (this.props.onCenterChange && this.geoService_.can_project()) {
      const topLeft = this.geoService_.unproject({x: 0, y: 0});
      const bottomRight = this.geoService_.unproject({x: this.geoService_.get_width(), y: this.geoService_.get_height()});
      const zoom = this.geoService_.get_zoom();
      const bounds = [topLeft.lat, topLeft.lng, bottomRight.lat, bottomRight.lng];
      const centerLatLng = this.geoService_.unproject({x: this.geoService_.get_width() / 2, y: this.geoService_.get_height() / 2});

      if (!isArraysEqualEps(bounds, this.prevBounds_, kEPS)) {
        this.props.onCenterChange([centerLatLng.lat, centerLatLng.lng], bounds, zoom);
        this.prevBounds_ = bounds;
      }

      if (__DEV__) { // TODO remove if all ok
        if (map) {
          const locBounds = map.getBounds();
          const ne = locBounds.getNorthEast();
          const sw = locBounds.getSouthWest();

          const gmC = map.getCenter();
          if (!isArraysEqualEps([centerLatLng.lat, centerLatLng.lng], [gmC.lat(), gmC.lng()], kEPS)) {
            console.error('cneter', gmC.lat(), gmC.lng()); // eslint-disable-line no-console
          }
          // compare with google map
          if (!isArraysEqualEps(bounds, [ne.lat(), sw.lng(), sw.lat(), ne.lng()], kEPS)) {
            console.error('arrays not equal', '\n', bounds, '\n', [ne.lat(), sw.lng(), sw.lat(), ne.lng()]); // eslint-disable-line no-console
          }
        }
      }
    }
  },

  componentWillMount() {
    const this_ = this;
    this.map_ = null;
    this.maps_ = null;
    this.prevBounds_ = null;
    // this.prev_center_ = null;
    this.mouse_ = null;
    this.dragTime_ = 0;
    this.fireMouseEventOnIdle_ = false;

    // this.__internal__display_name__ = this.constructor.displayName + '__' + __internalCounter__++;

    this.markersDispatcher_ = merge(Emitter.prototype, {
      getChildren() {
        return this_.props.children;
      },
      getMousePosition() {
        return this_.mouse_;
      }
    });
    this.geoService_ = new Geo(sc.kGOOGLE_TILE_SIZE, sc.kCALC_MAP_TRANSFORM_FROM_LEFT_TOP);
  },

  componentDidMount() {
    this.mounted_ = true;
    window.addEventListener('resize', this.onWindowResize_);

    setTimeout(() => { // to detect size
      this.onWindowResize_();

      const brLatLng = getLeftTopFromCenter(this.geoService_.get_width(), this.geoService_.get_height(), this.props.center || this.props.defaultCenter, this.props.zoom);
      this.geoService_.set_view([brLatLng.lat, brLatLng.lng], this.props.zoom, 0);

      this.onBoundsChanged_(); // now we can calculate map bounds center etc...

      gmapLoader()
      .then(maps => {
        if (!this.mounted_) {
          return;
        }

        const centerLatLng = this.geoService_.unproject({x: this.geoService_.get_width() / 2, y: this.geoService_.get_height() / 2});

        const propsOptions = {
          zoom: this.props.zoom,
          center: new maps.LatLng(centerLatLng.lat, centerLatLng.lng)
        };

        const mapOptions = Object.assign({}, K_MAP_CONTROL_OPTIONS, this.props.options || {}, propsOptions);

        const map = new maps.Map(this.refs.google_map_dom.getDOMNode(), mapOptions);
        this.map_ = map;
        this.maps_ = maps;

        // render in overlay
        const this_ = this;
        const overlay = Object.assign(new maps.OverlayView(), {
          onAdd() {
            const div = document.createElement('div');
            this.div = div;
            div.style.backgroundColor = 'transparent';
            div.style.position = 'absolute';
            div.style.left = '0px';
            div.style.right = '0px';
            div.style.top = '0px';
            div.style.width = '2000px';
            div.style.height = '2000px';
            const panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(div);

            React.render((
              <GoogleMapMarkers
                onChildMouseEnter={this_.onChildMouseEnter_}
                onChildMouseLeave={this_.onChildMouseLeave_}
                geo_service={this_.geoService_}
                distanceToMouse={this_.props.distanceToMouse}
                hoverDistance={this_.props.hoverDistance}
                dispatcher={this_.markersDispatcher_} />),
              div
            );
          },

          draw() {
            const overlayProjection = this.getProjection();
            const bounds = map.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            const ptx = overlayProjection.fromLatLngToDivPixel(new maps.LatLng(ne.lat(), sw.lng()));
            const div = this.div;

            raf( () => {
              // div.style.transform = `translate(${ptx.x}px, ${ptx.y}px)`; // bad solution
              div.style.left = `${ptx.x}px`;
              div.style.top = `${ptx.y}px`;
              if (this_.markersDispatcher_) {
                this_.markersDispatcher_.fire('kON_CHANGE');
              }
            });

            this_.onBoundsChanged_(map, maps);
          }
        });

        overlay.setMap(map);


        maps.event.addListener(map, 'idle', () => {
          const div = overlay.div;
          const overlayProjection = overlay.getProjection();
          const bounds = map.getBounds();
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          const ptx = overlayProjection.fromLatLngToDivPixel(new maps.LatLng(ne.lat(), sw.lng()));

          raf( () => {
            this_.dragTime_ = 0;
            div.style.left = `${ptx.x}px`;
            div.style.top = `${ptx.y}px`;
            if (this_.markersDispatcher_) {
              this_.markersDispatcher_.fire('kON_CHANGE');
              if (this_.fireMouseEventOnIdle_) {
                this_.markersDispatcher_.fire('kON_MOUSE_POSITION_CHANGE');
              }
            }
          });

          this_.onBoundsChanged_(map, maps);
        });

        maps.event.addListener(map, 'mouseout', () => {
          this_.mouse_ = null;
          this_.markersDispatcher_.fire('kON_MOUSE_POSITION_CHANGE');
        });

        maps.event.addListener(map, 'drag', () => {
          this_.dragTime_ = (new Date()).getTime();
        });


        maps.event.addListener(map, 'mousemove', (e) => {
          if (!this_.mouse_) {
            this_.mouse_ = {x: 0, y: 0, lat: 0, lng: 0};
          }
          const K_IDLE_TIMEOUT = 100;
          const currTime = (new Date()).getTime();

          this_.mouse_.x = e.pixel.x;
          this_.mouse_.y = e.pixel.y;
          this_.mouse_.lat = e.latLng.lat();
          this_.mouse_.lng = e.latLng.lng();
          if (currTime - this_.dragTime_ < K_IDLE_TIMEOUT) {
            this_.fireMouseEventOnIdle_ = true;
          } else {
            this_.markersDispatcher_.fire('kON_MOUSE_POSITION_CHANGE');
            this_.fireMouseEventOnIdle_ = false;
          }
        });
      })
      .catch( e => {
        console.error(e); // eslint-disable-line no-console
        throw e;
      });
    }, 0, this);
  },

  componentWillUnmount() {
    this.mounted_ = false;

    window.removeEventListener('resize', this.onWindowResize_);

    if (this.maps_ && this.map_) {
      this.maps_.event.clearInstanceListeners(this.map_);
    }

    this.map_ = null;
    this.maps_ = null;
    this.markersDispatcher_.destroy();

    delete this.map_;
    delete this.markersDispatcher_;
  },

  componentWillReceiveProps(nextProps) {
    if (this.map_) {
      const centerLatLng = this.geoService_.unproject({x: this.geoService_.get_width() / 2, y: this.geoService_.get_height() / 2});
      if (nextProps.center) {
        if (Math.abs(nextProps.center[0] - centerLatLng.lat) + Math.abs(nextProps.center[1] - centerLatLng.lng) > kEPS) {
          const brLatLng = getLeftTopFromCenter(this.geoService_.get_width(), this.geoService_.get_height(), nextProps.center, nextProps.zoom);
          this.geoService_.set_view([brLatLng.lat, brLatLng.lng], nextProps.zoom, 0);

          const newCenterLatLng = this.geoService_.unproject({x: this.geoService_.get_width() / 2, y: this.geoService_.get_height() / 2});
          this.map_.panTo({lat: newCenterLatLng.lat, lng: newCenterLatLng.lng});
        }
      }

      // if zoom chaged by user
      if (Math.abs(nextProps.zoom - this.props.zoom) > 0) {
        this.map_.setZoom(nextProps.zoom);
      }
    }
  },

  componentDidUpdate() {
    this.markersDispatcher_.fire('kON_CHANGE');
  },

  render() {
    return (
      <div className={this.props.className}>
        <GoogleMapMap ref="google_map_dom"/>
      </div>
    );
  }
});

module.exports = GoogleMap;
