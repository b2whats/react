'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var YandexMap = require('components/yandex/yandex_map.jsx');
/* jshint ignore:end */
//var ymap_loader = require('third_party/yandex_maps.js');


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin],
  

  render () {
    //для не загрузки скриптов яндекс карт YandexMap элемент показываем только когда его первый раз попросят показаться
    //потом тупо играем стилями, отсюда у карты по хорошему два свойства висибл и дисплей

    return (
      <div className={this.props.className}>
        <div className="search-page-yandex-map search-page-yandex-map-map-visible">
          
          <YandexMap />
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
