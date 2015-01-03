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
var SearchPageMapHeaderBlock = require('./search_page_map_header_block.jsx');
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
var kBTN_TEXT={0:'Показать карту', 1:'Скрыть карту'};


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  

  on_map_visibility_changed () {
    console.log('change');
    search_page_actions.search_page_map_visibility_chaged(!this.state.map_visible);
  },

  //search_page_map_visibility_chaged

  render () {
    //для не загрузки скриптов яндекс карт YandexMap элемент показываем только когда его первый раз попросят показаться
    //потом тупо играем стилями, отсюда у карты по хорошему два свойства висибл и дисплей
    var class_name_search_page_yandex_map = cx('search-page-yandex-map');

    class_name_search_page_yandex_map = this.state.map_visible ? 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-visible') : 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-hidden');

    var ya_map;
    if (this.state.map_display === true) {
      ya_map = <YandexMap />;
    }
    var options_from = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>);
    var options_to = _.map(kWORK_HOURS, (value, index) => <option key={index} value={index}>{value}</option>)


    return (
      <div className={this.props.className}>
        <div className={class_name_search_page_yandex_map}>
          
          <SearchPageMapHeaderBlock 
            map_visible={this.state.map_visible}
            on_map_visibility_changed={this.on_map_visibility_changed}/>
        
          {ya_map}          
        
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
