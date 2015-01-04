'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var search_page_store = require('stores/search_page_store.js');
//var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_visible: search_page_store.get_search_page_map_visible (),

  star_hover_value: search_page_store.get_star_hover_value(),
  star_click_value: search_page_store.get_star_click_value()
}),
search_page_store /*observable store list*/);

var search_page_actions = require('actions/search_page_actions.js');


var kWORK_HOURS = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
var kBTN_TEXT=['Скрыть карту', 'Показать карту'];


var SearchPageMapHeaderBlock = React.createClass({
  /*
  propTypes: {
    on_map_visibility_changed: PropTypes.func.isRequired,
    map_visible: PropTypes.bool.isRequired
  },
  */
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_star_mouse_enter(value) {
    search_page_actions.search_page_header_rating_star_hover(value);
  },
  
  on_star_mouse_click(value) {
    search_page_actions.search_page_header_rating_star_click(value);
  },

  on_star_mouse_leave() {
    search_page_actions.search_page_header_rating_star_hover(-1);
  },

  on_map_visibility_changed () {
    search_page_actions.search_page_map_visibility_chaged(!this.state.map_visible);
  },

  render () {
    
    //TODO сделать ту не больше фром
    var options_from = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>);
    var options_to = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>)

    var btn_show_map_button_text = this.state.map_visible ?  kBTN_TEXT[0] : kBTN_TEXT[1];

    var StarList = _.map(_.range(0,5), value => 
      <span key={value} 
        onClick={() => this.on_star_mouse_click(value)} 
        onMouseEnter={() => this.on_star_mouse_enter(value)} 
        className={cx('search-page-yandex-map-header-rating-star', 
                   cx({
                    'star-hovered': value<=this.state.star_hover_value,
                    'star-selected': value<=this.state.star_click_value,
                    'star-in-selection': this.state.star_hover_value>=0 }))}>*</span>, this);

    return (
      <div className="search-page-yandex-map-header">
        <div className="wrap gutter-5-xs">
          {/*левая часть заголовка*/}
          <div className="md-12-3 left-md search-page-map-header">
            <strong>Рейтинг</strong>
            <div onMouseLeave={this.on_star_mouse_leave} className="search-page-yandex-map-header-rating">
              {StarList}
            </div>
          </div>              
          {/*центральная часть заголовка*/}
          <div className="md-12-5 left-md search-page-map-header">
            <strong>Время работы</strong>
            <div className="search-page-yandex-map-header-select-holder">
              <select defaultValue={4} className="search-page-yandex-map-header-select">
                {options_from}
              </select>
            </div>
            <div>-</div>
            <div className="search-page-yandex-map-header-select-holder">
              <select defaultValue={10} className="search-page-yandex-map-header-select">
                {options_to}
              </select>
            </div>              
          </div>              
          {/*правая часть заголовка*/}
          <div className="md-12-4 right-md search-page-map-header">
            <button className="search-page-yandex-map-header-button 
                               search-page-yandex-map-header-button-switch">^</button>
            <button onClick={this.on_map_visibility_changed} 
                    className="search-page-yandex-map-header-button 
                               search-page-yandex-map-header-button-hide">{btn_show_map_button_text}</button>
          </div>
        </div>        
      </div>        
    );
  }
});

module.exports = SearchPageMapHeaderBlock;
