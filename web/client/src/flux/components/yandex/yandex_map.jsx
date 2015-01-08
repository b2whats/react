'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var YandexMapMap = require('./yandex_map_map.jsx');
/* jshint ignore:end */

var ymap_baloon_template =  require('./templates/yandex_baloon_template.jsx');
var ymap_loader = require('third_party/yandex_maps.js');

var kANIM_MOVE_DUARATION = 500;
var kMARKER_DEFAULT_PRESET = 'islands#blueIcon';
var kOBJECT_MANAGER_OPTIONS = {
    clusterize: false,
    geoObjectBalloonCloseButton: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonPanelMaxMapArea: 0,
    geoObjectBalloonOffset:[3,-40],
    geoObjectBalloonAutoPanMargin: 70,
    geoObjectOpenBalloonOnClick: false
  };

var YandexMap = React.createClass({  
  mixins: [PureRenderMixin],
  
  propTypes: {
    width: PropTypes.number.isRequired, //размеры карты нужны чтобы считать проекции еще до появления карты
    height: PropTypes.number.isRequired,
    header_height: PropTypes.number, //кол-во пикселей сверху относительно которых сдвигается центр карты на header_height/2
    bounds: PropTypes.array.isRequired, //какой кусок карты показать
    marker_preset: PropTypes.string, //презеты иконок яндекса islands#blueIcon
    on_marker_click: PropTypes.func,
    on_close_ballon_click: PropTypes.func,
    on_balloon_event: PropTypes.func
  },

  getInitialState() {
    return {
      yamap: null
    };
  },  
  
  componentWillMount() {
    this.yamap = null;
  },
  
  on_marker_click(e) {
    var object_id = e.get('objectId');
    this.props.on_marker_click && this.props.on_marker_click(object_id); //jshint ignore:line
  },

  on_balloon_event (event_source, marker_id, marker_properties) {
    if(event_source === 'CLOSE_CLICK') {
      this.props.on_close_ballon_click && this.props.on_close_ballon_click(marker_id); //jshint ignore:line
    } else { //например SHOW_PHONE_CLICK
      this.props.on_balloon_event && this.props.on_balloon_event(event_source, marker_id, marker_properties); //jshint ignore:line
    }    
  },

  on_balloon_closed (e) { //яндекс порой сам закрывает балун  например при муве карты сильном поэтому метод нужен
    var object_id = e.get('objectId');
    this.props.on_close_ballon_click && this.props.on_close_ballon_click(object_id); //jshint ignore:line
  },

  componentDidMount() {    
    ymap_loader.get_ymaps_promise()
      .then(ymaps => {
        if(this.isMounted()) {
          var pos_w_delta = this.get_center_and_zoom(ymaps, this.props.bounds);
          
          var yamap = new ymaps.Map(this.refs.yamap_dom.getDOMNode(), _.extend({}, pos_w_delta, {
                controls: ['zoomControl']
          }));

          var baloon_template = ymap_baloon_template(ymaps, this.on_balloon_event);

          var object_manager = new ymaps.ObjectManager(
            _.extend({}, kOBJECT_MANAGER_OPTIONS, 
                        {geoObjectBalloonContentLayout: baloon_template}));

          object_manager.objects.options.set('preset', this.props.marker_preset || kMARKER_DEFAULT_PRESET);

          object_manager.objects.events.add('click', this.on_marker_click);
          object_manager.objects.events.add('on_balloon_button_click', this.on_balloon_button_click);
          object_manager.objects.balloon.events.add('close', this.on_balloon_closed);//яндекс порой сам закрывает балун       
          
          yamap.geoObjects.add(object_manager);

          this.setState({
              yamap: yamap,
              object_manager: object_manager
            }
          );
        }
      })
      .catch(e => {
        console.error(e.stack);
        console.error(e);
      });
  },

  componentWillUnmount() {
    if(this.state.yamap) {
      this.state.yamap.destroy();      
    }
  },

  componentWillReceiveProps(next_props) {
    //достаточно один угол проверять
    var yamap = this.state.yamap;

    if(yamap!==null) {
      if(next_props.bounds[0][0]!=this.props.bounds[0][0] || next_props.bounds[0][1]!=this.props.bounds[0][1]) {
        ymap_loader.get_ymaps_promise()
          .then(ymaps => {
            var pos_w_delta = this.get_center_and_zoom(ymaps, next_props.bounds);
            yamap.setCenter(pos_w_delta.center, pos_w_delta.zoom, {
              duration: kANIM_MOVE_DUARATION
            });
          })
          .catch(e => {
            console.error(e.stack);
            console.error(e);
          });
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
    var fake_children  = this.state.object_manager ? React.Children.map(this.props.children, child => //jshint ignore:line
      React.addons.cloneWithProps(child, {object_manager: this.state.object_manager, key: child.key})) : null;
    /* jshint ignore:start */
    return (
      <div className="yandex-map-holder">
        {fake_children}
        <YandexMapMap ref="yamap_dom"/>      
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = YandexMap;
