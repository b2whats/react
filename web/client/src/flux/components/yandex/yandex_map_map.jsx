'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var YandexMapMap = React.createClass({
  shouldComponentUpdate() {
    return false; //внутри этой директивы реакт не работает поэтому нет смысла ее обновлять методами реакт
  },
  render () {
    return <div ref="yamap_dom" className="yandex-map"></div>;
  }
});

module.exports = YandexMapMap;
