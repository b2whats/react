'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var YandexMapMap = require('./yandex_map_map.jsx');
/* jshint ignore:end */


var ymap_loader = require('third_party/yandex_maps.js');

var kMARKER_DEFAULT_PRESET = 'islands#icon';

var YandexMapAddressSelect = React.createClass({  
  mixins: [PureRenderMixin],
  
  propTypes: {
    width: PropTypes.number.isRequired, //размеры карты нужны чтобы считать проекции еще до появления карты
    height: PropTypes.number.isRequired,
    bounds: PropTypes.array.isRequired, //какой кусок карты показать
    coordinates: PropTypes.array,
    search: PropTypes.string,
    icon_color: PropTypes.string,
    onChange: PropTypes.func
  },

  getInitialState() {
    return {
      yamap: null
    };
  },  

  componentWillMount() {
    this.yamap = null;
    this.markers_collection = null;
  },

  onAddressChanged (address_string, coords) {
    this.props.onChange && this.props.onChange(address_string, coords); //jshint ignore:line
  },

  componentDidMount() {    
    ymap_loader.get_ymaps_promise()
      .then(ymaps => {
        if(this.isMounted()) {
          var pos_w_delta = this.get_center_and_zoom(ymaps, this.props.bounds);
          
          var yamap = new ymaps.Map(this.refs.yamap_dom.getDOMNode(), _.extend({}, pos_w_delta, {
            controls: ['zoomControl']
          }));

          var search_control = new ymaps.control.SearchControl({
            options: {
              position: {right: '10px', left: '10px', top: '10px'},
              zoomMargin: [0,0,0,0],
              noPlacemark: true
            }
          });
          
          yamap.controls.add(search_control);
          

          var kMARKER_COLOR = 'green';
          try{

            this.markers_collection = new ymaps.GeoObjectCollection(null, {
              'preset': kMARKER_DEFAULT_PRESET,
              draggable: true
            });

            var initial_coords = _.clone(this.props.coordinates);
            //console.log(initial_coords);
            //this.markers_collection.options.set('preset', kMARKER_DEFAULT_PRESET);
            this.markers_collection.options.set('iconColor', this.props.icon_color || kMARKER_COLOR);

            yamap.geoObjects.add(this.markers_collection);
            
            search_control.events.add('resultselect', res => {
              var index = res.get('index'); 
              search_control.getResult(index).then( geo_object => {
                
                var search_string = search_control.getRequestString();
                var coords;

                if( this.props.search && this.props.search === search_string) {
                  coords = initial_coords || geo_object.geometry.getCoordinates();
                } else {
                  coords = geo_object.geometry.getCoordinates();                  
                }

                this.onAddressChanged (search_string, coords);
                
                var placemark = new ymaps.Placemark(coords, {});
                
                placemark.events.add('dragend', () => {
                  this.onAddressChanged (search_string, placemark.geometry.getCoordinates());
                });

                this.markers_collection.add(placemark);
              });
            });

            search_control.events.add('submit', () => this.markers_collection.removeAll());

            if(this.props.search) {
              search_control.search(this.props.search);
            }
          
          } catch(e) {
            console.error(e);
          }
        }
      });
  },

  componentWillUnmount() {
    if(this.state.yamap) {
      this.state.yamap.destroy();      
    }
  },

  componentWillReceiveProps(next_props) {
    if(next_props.icon_color!==this.props.icon_color) {
      if(this.markers_collection!==null) {
        this.markers_collection.options.set('iconColor', next_props.icon_color);
      }
    }
  },

  get_center_and_zoom (ymaps, bounds) {
    var delta = this.props.header_height || 0;

    var merkator = ymaps.projection.wgs84Mercator; //дефолтная проекция яндекс карт
    var pos = ymaps.util.bounds.getCenterAndZoom(
      bounds,
      [this.props.width, this.props.height - delta] //занижаем высоту карты на высоту хедера
    );

    var global_center = merkator.toGlobalPixels(pos.center, pos.zoom);
    global_center[1] = global_center[1] - delta/2;
    var pos_center = merkator.fromGlobalPixels(global_center, pos.zoom);
    var pos_w_delta = _.extend({}, pos, {center: pos_center});
    return pos_w_delta;
  },
  
  render () {

    return (
      /* jshint ignore:start */
      <div className={this.props.className} style={this.props.style}>
        <YandexMapMap ref="yamap_dom"/> 
      </div>
      /* jshint ignore:end */
    );
  }
});

module.exports = YandexMapAddressSelect;





