'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;


//var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
//var Link = require('components/link.jsx');
/* jshint ignore:end */
var ymap_loader = require('third_party/yandex_maps.js');


var YandexMap = React.createClass({
  
  propTypes: {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    header_height: PropTypes.number
  },
  

  //mixins: [PureRenderMixin],
  shouldComponentUpdate() {
    return false; //внутри этой директивы реакт не работает поэтому нет смысла ее обновлять методами реакт
  },
  
  componentWillMount() {
    this.yamap = null;
  },
  
  componentDidMount() {    
    ymap_loader.get_ymaps_promise()
      .then(ymaps => {
        if(this.isMounted()) {          
          var pos_w_delta = this.get_center_and_zoom([[59.744465, 30.042834], [60.090935, 30.568322]]);

          this.yamap = new ymaps.Map(this.refs.yamap.getDOMNode(), _.extend({}, pos_w_delta, {
            controls: ['zoomControl']
          }));
        }
      });
  },

  componentWillUnmount() {
    if(this.yamap) {
      this.yamap.destroy();
    }
  },

  get_center_and_zoom (bounds) {
    var delta = this.props.header_height || 0;

    var merkator = ymaps.projection.wgs84Mercator;
    var pos = ymaps.util.bounds.getCenterAndZoom(
      bounds,
      [this.props.width, this.props.height - delta] //занижаем высоту карты на высоту хедера
    );

    var global_center = merkator.toGlobalPixels(pos.center, pos.zoom);
    global_center[1] = global_center[1] - delta/2;
    var pos_center = merkator.fromGlobalPixels(global_center, pos.zoom);

    console.log(pos.center, pos_center);
    var pos_w_delta = _.extend({}, pos, {center: pos_center});

    return pos_w_delta;
  },


  render () {
    return (
      <div ref="yamap" className="yandex-map">
      </div>
    );
  }
});

module.exports = YandexMap;
