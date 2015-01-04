'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

//var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
//var Link = require('components/link.jsx');
/* jshint ignore:end */
var ymap_loader = require('third_party/yandex_maps.js');


var YandexMap = React.createClass({
  /*
  propTypes: {
    className: PropTypes.string
  },
  */

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
          this.yamap = new ymaps.Map(this.refs.yamap.getDOMNode(), {
            center: [55.7, 37.5],
            zoom: 9,
            controls: ['zoomControl']
          });
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
