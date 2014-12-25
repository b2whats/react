'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var Header = React.createClass({
  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div className="hfm-wrapper main-header header entire-width">
        <div className="header-region">
          <img src="images/templates/icon-map.png" alt="" />
          <div className="stylized-select select-dotted">
            <span className="stylized-select__select-text">Санкт-Петербург</span>
            
            <div style={{display:'None'}} className="stylized-select__dropdown">
              <div className="stylized-select__search">
                <input type="text" placeholder="Поиск..." />
              </div>
              <ul className="stylized-select__list">
                <li>Москва</li>
                <li>Калининград</li>
                <li>Екатеринбург</li>
                <li>Саратов</li>
                <li>Владивосток</li>
              </ul>
            </div>
          </div>
        </div>
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
