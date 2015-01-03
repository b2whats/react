'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */
var ymap_loader = require('third_party/yandex_maps.js');


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin],
  
  componentWillMount() {
    this.yamap = null;
  },
  
  componentDidMount() {
    console.time('yaload');
    
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
      <div className={this.props.className}>
        <div className="search-page-yandex-map-border-radius">
          <div ref="yamap" className="search-page-yandex-map">
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
