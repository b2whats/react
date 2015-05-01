'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var GoogleMapMap = React.createClass({
  shouldComponentUpdate() {
    return false; //внутри этой директивы реакт не работает поэтому вырубаем его во избежание ошибок
  },
  render () {
    return <div style={style}></div>;
  }
});

var style = {
  height: '100%',
  margin: 0,
  padding: 0,  
};

module.exports = GoogleMapMap;
