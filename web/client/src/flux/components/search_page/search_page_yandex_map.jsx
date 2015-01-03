'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var YandexMap = require('components/yandex/yandex_map.jsx');
/* jshint ignore:end */

var search_page_store = require('stores/search_page_store.js');
//var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_visible: search_page_store.get_search_page_map_visible (),
  map_display: search_page_store.get_search_page_map_display ()
}),
search_page_store /*observable store list*/);

var search_page_actions = require('actions/search_page_actions.js');



var kWORK_HOURS = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];

var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  

  change_map_visibility () {
    console.log('change');
    search_page_actions.search_page_map_visibility_chaged(!this.state.map_visible);
  },

  //search_page_map_visibility_chaged

  render () {
    //для не загрузки скриптов яндекс карт YandexMap элемент показываем только когда его первый раз попросят показаться
    //потом тупо играем стилями, отсюда у карты по хорошему два свойства висибл и дисплей
    var class_name = cx('search-page-yandex-map');

    class_name = this.state.map_visible ? cx(class_name,'search-page-yandex-map-map-visible') : cx(class_name,'search-page-yandex-map-map-hidden');

    var ya_map;
    if (this.state.map_display === true) {
      ya_map = <YandexMap />;
    }
    var options_from = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>);
    var options_to = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>)


    return (
      <div className={this.props.className}>
        <div className={class_name}>
          <div className="search-page-yandex-map-header">
            <div className="wrap gutter-5-xs">
              <div className="md-12-3 left-md">
                <div className="search-page-yandex-map-header-element"><strong>Рейтинг</strong></div>
              </div>
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
              <div className="md-12-3 right-md">
                <button className="search-page-yandex-map-header-element search-page-yandex-map-header-button search-page-yandex-map-header-button-switch">^</button>
                <button onClick={this.change_map_visibility} className="search-page-yandex-map-header-element search-page-yandex-map-header-button search-page-yandex-map-header-button-hide">Показать карту</button>
              </div>
          </div>
        </div>
          {ya_map}          
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
