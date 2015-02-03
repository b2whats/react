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


var YandexMapAddressSelect = React.createClass({  
  mixins: [PureRenderMixin],

  getInitialState() {
    return {
      yamap: null
    };
  },  

  componentWillMount() {
    this.yamap = null;
  },

  componentDidMount() {    
    ymap_loader.get_ymaps_promise()
      .then(ymaps => {
        if(this.isMounted()) {
          var pos_w_delta = this.get_center_and_zoom(ymaps, this.props.bounds);
          
          var yamap = new ymaps.Map(this.refs.yamap_dom.getDOMNode(), _.extend({}, pos_w_delta, {
            controls: ['zoomControl']
          }));

          var searchControl = new ymaps.control.SearchControl({
            options: {
              provider: 'yandex#search',
              position: {right: '10px', left: '10px', top: '10px'},
              zoomMargin: [0,0,0,0]

            }
          });
          
          yamap.controls.add(searchControl);



        }
      })
  },

  componentWillUnmount() {
    if(this.state.yamap) {
      this.state.yamap.destroy();      
    }
  },

  componentWillReceiveProps(next_props) {
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
      <div className={this.props.className} style={this.props.style}>
        <YandexMapMap ref="yamap_dom"/> 
      </div>
    );
  }
});

module.exports = YandexMapAddressSelect;





