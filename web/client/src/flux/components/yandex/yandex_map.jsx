'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;


//var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
//var Link = require('components/link.jsx');
/* jshint ignore:end */
var ymap_loader = require('third_party/yandex_maps.js');

var kANIM_MOVE_DUARATION = 500;


var YandexMap = React.createClass({
  
  propTypes: {
    width: PropTypes.number.isRequired, //размеры карты нужны чтобы считать проекции еще до появления карты
    height: PropTypes.number.isRequired,
    header_height: PropTypes.number,
    bounds: PropTypes.array.isRequired
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
          var pos_w_delta = this.get_center_and_zoom(this.props.bounds);

          this.yamap = new ymaps.Map(this.refs.yamap.getDOMNode(), _.extend({}, pos_w_delta, {
            controls: ['zoomControl']
          }));
        }
      });
  },

  componentWillUnmount() {
    if(this.yamap) {
      this.yamap.destroy();
      this.yamap = null;
    }
  },

  componentWillReceiveProps(next_props) {
    //достаточно один угол проверять
    if(this.yamap!==null) {
      if(next_props.bounds[0][0]!=this.props.bounds[0][0] || next_props.bounds[0][1]!=this.props.bounds[0][1]) {
        var pos_w_delta = this.get_center_and_zoom(next_props.bounds);
        this.yamap.setCenter(pos_w_delta.center, pos_w_delta.zoom, {
          duration: kANIM_MOVE_DUARATION
        });
      }
    }
  },

  get_center_and_zoom (bounds) {
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
      <div ref="yamap" className="yandex-map">
      </div>
    );
  }
});

module.exports = YandexMap;
