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
          var delta = this.props.header_height || 0;
          var pos = ymaps.util.bounds.getCenterAndZoom(
            [[59.744465, 30.042834], [60.090935, 30.568322]],
            [this.props.width, this.props.height - delta] //занижаем высоту карты на высоту хедера
          );
          
          this.yamap = new ymaps.Map(this.refs.yamap.getDOMNode(), _.extend({}, pos, {
            controls: ['zoomControl']
          }));

          //надо свдинуть карту на размер хедера, трабла в том что в разных частях мира px при равном зуме это разные
          //расстояния (см проекцию меркатора) - поэтому сдвигаем карту на эти px только после определения а не сразу
          var global_center = this.yamap.getGlobalPixelCenter();
          global_center[1] = global_center[1] - delta/2;

          this.yamap.setGlobalPixelCenter(global_center);
        }
      });
  },

  componentWillUnmount() {
    if(this.yamap) {
      this.yamap.destroy();
    }
  },

  render () {
    return (
      <div ref="yamap" className="yandex-map">
      </div>
    );
  }
});

module.exports = YandexMap;
