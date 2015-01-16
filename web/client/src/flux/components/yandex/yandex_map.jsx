'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var YandexMapMap = require('./yandex_map_map.jsx');
/* jshint ignore:end */

var trace = () => {
  if(false) {  
    console.log.apply(console, [].slice.call(arguments))
  }
};

var ymap_loader = require('third_party/yandex_maps.js');

var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kAUTO_PART_CLUSTER_COLOR = sass_vars['cluster-marker-color'];
var kANIM_MOVE_DUARATION = 500;
var kMARKER_DEFAULT_PRESET = 'islands#icon';
var kOBJECT_MANAGER_OPTIONS = {
    clusterize: true,
    //gridSize: 64,
    clusterDisableClickZoom: true,
    clusterBalloonContentLayout: 'cluster#balloonCarousel', //карусулька самое то
    
    //geoObjectBalloonCloseButton: false,
    
    geoObjectHideIconOnBalloonOpen: false,
    clusterHideIconOnBalloonOpen: false,

    geoObjectBalloonPanelMaxMapArea: 0,
    clusterBalloonPanelMaxMapArea: 0,
    
    geoObjectBalloonOffset:[3,-40],
    clusterBalloonOffset:[0,-24],

    geoObjectBalloonAutoPanMargin: 40,
    clusterBalloonAutoPanMargin: 10,

    geoObjectOpenBalloonOnClick: false,
    clusterOpenBalloonOnClick: false,

    geoObjectZIndex: 1,
    geoObjectZIndexHover: 1500,
    geoObjectZIndexActive: 1700,
    //geoObjectInteractiveZIndex: false
    clusterBalloonContentLayoutWidth: null,
    clusterBalloonContentLayoutHeight: null,
    
    //geoObjectBalloonContentLayoutWidth: 280,
    //geoObjectBalloonContentLayoutHeight: 140,

    clusterBalloonPagerSize: 5
  };

var YandexMap = React.createClass({  
  mixins: [PureRenderMixin],
  
  propTypes: {
    width: PropTypes.number.isRequired, //размеры карты нужны чтобы считать проекции еще до появления карты
    height: PropTypes.number.isRequired,
    baloon_template: PropTypes.func.isRequired,
    header_height: PropTypes.number, //кол-во пикселей сверху относительно которых сдвигается центр карты на header_height/2
    bounds: PropTypes.array.isRequired, //какой кусок карты показать
    marker_preset: PropTypes.string, //презеты иконок яндекса islands#blueIcon
    on_marker_click: PropTypes.func,
    on_marker_hover: PropTypes.func,
    on_close_ballon_click: PropTypes.func,
    on_balloon_event: PropTypes.func,
    on_bounds_change: PropTypes.func,
  },

  getInitialState() {
    return {
      yamap: null
    };
  },  
  
  componentWillMount() {
    this.yamap = null;
    this.move_after_down_timer = 0;
    this.mouse_is_down = false;

    this.event_freezed = false;
  },
  
  on_marker_click(e) {
    var object_id = e.get('objectId');
    this.props.on_marker_click && this.props.on_marker_click(object_id); //jshint ignore:line
  },

  on_balloon_event (event_source, marker_id, marker_properties) {
    if(event_source === 'kON_CLOSE_CLICK') {
      this.props.on_close_ballon_click && this.props.on_close_ballon_click(marker_id); //jshint ignore:line
    } else { //например SHOW_PHONE_CLICK
      this.props.on_balloon_event && this.props.on_balloon_event(event_source, marker_id, marker_properties); //jshint ignore:line
    }    
  },

  event_freezer () {
    this.event_freezed = true;
  },
  
  event_unfreezer () {
    this.event_freezed = false;
  },

  on_balloon_closed (e) { //яндекс порой сам закрывает балун  например при муве карты сильном поэтому метод нужен
    if (this.event_freezed) return;
    var object_id = e.get('objectId');
    trace('balloon closed ', object_id);
    this.props.on_close_ballon_click && this.props.on_close_ballon_click(object_id); //jshint ignore:line
  },

  on_marker_hover (e) {
    var object_id = e.get('objectId');
    if (e.get('type') === 'mouseenter') {
      this.props.on_marker_hover && this.props.on_marker_hover(object_id, true); //jshint ignore:line
    } else {
      this.props.on_marker_hover && this.props.on_marker_hover(object_id, false); //jshint ignore:line
    }
  },

  on_cluster_balloon_closed (e) { //яндекс порой сам закрывает балун  например при муве карты сильном поэтому метод нужен    
    //if (this.event_freezed) return;
    try {

      var object_id = e.get('objectId');
      var cluster = this.state.object_manager.clusters.getById(object_id);
      if(cluster) {
        var objs = _.filter(cluster.properties.geoObjects, g => g.properties.is_open);
      
        if(objs) {
          _.each(objs, o => {
            this.props.on_close_ballon_click && this.props.on_close_ballon_click(o.id);
            trace('cluster balloon closed closed', o.id);
          });
        }
      }
    } catch(e) {
      console.error(e);
      console.error(e.stack());
    }
  },
  
  on_cluster_remove (e) {
    var object_id = e.get('objectId');
    var cluster = e.get('child');
    
    var objs = _.filter(cluster.properties.geoObjects, g => g.properties.is_open);
    if(objs) {
      _.each(objs, o => {
        this.props.on_close_ballon_click && this.props.on_close_ballon_click(o.id)
        trace('cluster balloon closed ', o.id);
      });
    }
  },

  on_cluster_click(e) {
    var object_id = e.get('objectId');
    var cluster = this.state.object_manager.clusters.getById(object_id);
    var object_ids = _.map(cluster.properties.geoObjects, geo => geo.id);
    var idx=0;
    //console.log('cl click', object_ids[idx]);
    this.props.on_marker_click && this.props.on_marker_click(object_ids[idx]);
  },

  on_cluster_hover (e) {
    var object_id = e.get('objectId');
    if (e.get('type') === 'mouseenter') {
      var cluster = this.state.object_manager.clusters.getById(object_id);
      var object_ids = _.map(cluster.properties.geoObjects, geo => geo.id);      
      //для подсветить кластер достаточно чтобы один айтем в нем был подсвечен
      this.props.on_marker_hover && this.props.on_marker_hover(object_ids, true);
    } else {
      var cluster = this.state.object_manager.clusters.getById(object_id);
      var object_ids = _.map(cluster.properties.geoObjects, geo => geo.id);      
      //для подсветить кластер достаточно чтобы один айтем в нем был подсвечен
      this.props.on_marker_hover && this.props.on_marker_hover(object_ids, false);
    }
  },


  //В этом методе я отлавливаю именно юзерские изменения границ карты
  //и так как меня волнуют изменения только центра то я не отлавливаю юзерские клики по кнопкам зума
  on_boundschange (e) {
    var kTIME_USER_BOUND_CHANGED_EPSILON = 1000; //секунда
    //тут надо отделить юзерские события от неюзерских
    if((new Date()).getTime() - this.move_after_down_timer < kTIME_USER_BOUND_CHANGED_EPSILON) {
      console.log('USER CHANGED MAP', e.get('newCenter'), e.get('newZoom'));    
      this.props.on_bounds_change && this.props.on_bounds_change(e.get('newCenter'), e.get('newZoom'));
    }
  
  },

  mouse_up () {
  },
  
  mouse_down () {
    console.log('mdown');
    this.mouse_is_down = true;
    this.move_after_down_timer = 0;
  },
  
  mouse_move () {    
    if(this.mouse_is_down) {
      console.log('move');
      this.move_after_down_timer = (new Date()).getTime();
    }
  },
  
  mouse_wheel () {
    console.log('wheel');
    this.move_after_down_timer = (new Date()).getTime();
  },

  componentDidMount() {    
    ymap_loader.get_ymaps_promise()
      .then(ymaps => {
        if(this.isMounted()) {
          var pos_w_delta = this.get_center_and_zoom(ymaps, this.props.bounds);
          
          var yamap = new ymaps.Map(this.refs.yamap_dom.getDOMNode(), _.extend({}, pos_w_delta, {
                controls: ['zoomControl']
          }));

          this.props.on_bounds_change && this.props.on_bounds_change(pos_w_delta.center, pos_w_delta.zoom);

          yamap.events.add('boundschange', this.on_boundschange);
                    
          //пиздец яндекс даже простые евенты не работают в разных случаях
          //yamap.events.add('wheel', () => this.mouse_wheel);
          //yamap.events.add('mousedown', () => console.log('mousedown'));
          //yamap.events.add('mouseup', () => console.log('mouseup'));
          //yamap.events.add('mousemove', () => console.log('mousemove'));
          

          var baloon_template = this.props.baloon_template(ymaps, this.on_balloon_event);
          var cluster_baloon_template = this.props.cluster_baloon_template(ymaps, this.on_balloon_event);

          var object_manager = new ymaps.ObjectManager(
            _.extend({}, kOBJECT_MANAGER_OPTIONS, 
                        {geoObjectBalloonContentLayout: baloon_template,
                         clusterBalloonItemContentLayout: cluster_baloon_template}));

          object_manager.objects.options.set('preset', kMARKER_DEFAULT_PRESET);


          object_manager.clusters.options.set({
            clusterIconColor: kAUTO_PART_CLUSTER_COLOR //'red'
          });
          
          object_manager.clusters.events.add(['mouseenter', 'mouseleave'], this.on_cluster_hover);
          object_manager.clusters.events.add('click', this.on_cluster_click);

          object_manager.objects.events.add('click', this.on_marker_click);
          object_manager.objects.events.add(['mouseenter', 'mouseleave'], this.on_marker_hover);
          
          object_manager.objects.balloon.events.add('close', this.on_balloon_closed);//яндекс порой сам закрывает балун       
          object_manager.clusters.balloon.events.add('close', this.on_cluster_balloon_closed);//яндекс порой сам закрывает балун

          object_manager.clusters.events.add('remove', this.on_cluster_remove);

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

            this.props.on_bounds_change && this.props.on_bounds_change(pos_w_delta.center, pos_w_delta.zoom);

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
      React.addons.cloneWithProps(child, 
        {
          object_manager: this.state.object_manager,
          key: child.key,
          event_freezer: this.event_freezer,
          event_unfreezer: this.event_unfreezer})) : null;
    /* jshint ignore:start */
    return (
      <div onWheel={this.mouse_wheel} onMouseMove={this.mouse_move} onMouseDown={this.mouse_down} onMouseUp={this.mouse_up} className="yandex-map-holder">
        {fake_children}
        <YandexMapMap ref="yamap_dom"/>      
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = YandexMap;
