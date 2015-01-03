'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */


var kWORK_HOURS = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
var kBTN_TEXT=['Скрыть карту', 'Показать карту'];


var SearchPageMapHeaderBlock = React.createClass({
  propTypes: {
    on_map_visibility_changed: PropTypes.func.isRequired,
    map_visible: PropTypes.bool.isRequired
  },

  mixins: [PureRenderMixin],

  render () {

    var options_from = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>);
    var options_to = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>)

    var btn_show_map_button_text = this.props.map_visible ?  kBTN_TEXT[0] : kBTN_TEXT[1];

    return (
      <div className="search-page-yandex-map-header">
        <div className="wrap gutter-5-xs">
          {/*левая часть заголовка*/}
          <div className="md-12-3 left-md">
            <div className="search-page-yandex-map-header-element"><strong>Рейтинг</strong></div>
          </div>              
          {/*центральная часть заголовка*/}
          <div className="md-12-6 left-md">
            <div className="search-page-yandex-map-header-element"><strong>Время работы</strong></div>
            <div className="search-page-yandex-map-header-element search-page-yandex-map-header-select-holder">
              <select defaultValue={4} className="search-page-yandex-map-header-select">
                {options_from}
              </select>
            </div>
            <div className="search-page-yandex-map-header-element">-</div>
            <div className="search-page-yandex-map-header-element search-page-yandex-map-header-select-holder">
              <select defaultValue={10} className="search-page-yandex-map-header-select">
                {options_to}
              </select>
            </div>              
          </div>              
          {/*правая часть заголовка*/}
          <div className="md-12-3 right-md">
            <button className="search-page-yandex-map-header-element 
                               search-page-yandex-map-header-button 
                               search-page-yandex-map-header-button-switch">^</button>
            <button onClick={this.props.on_map_visibility_changed} 
                    className="search-page-yandex-map-header-element 
                               search-page-yandex-map-header-button 
                               search-page-yandex-map-header-button-hide">{btn_show_map_button_text}</button>
          </div>
        </div>        
      </div>        
    );
  }
});

module.exports = SearchPageMapHeaderBlock;
