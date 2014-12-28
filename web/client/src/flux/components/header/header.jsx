'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var RegionSelector = require('./region_selector.jsx');
/* jshint ignore:end */

var Header = React.createClass({
  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div className="hfm-wrapper main-header header entire-width">
        
        <RegionSelector />

        <div className="top-navbar">
          <Link href="#">Каталог компаний</Link>
          <Link className="no-href">|</Link>
          <Link className="ap-link" href="#">Регистрация</Link>
          <Link className="ap-link" href="#">Вход</Link>
        </div>
      </div>      
    );
  }
});

module.exports = Header;
