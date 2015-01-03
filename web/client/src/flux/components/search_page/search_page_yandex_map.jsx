'use strict';

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





var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  

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



    return (
      <div className={this.props.className}>
        <div className={class_name}>
          <div className="search-page-yandex-map-header">
            <div className="wrap gutter-5-xs">
              <div className="md-12-3">
                Рейтинг
              </div>
              <div className="md-12-6">
                Рейтинг
              </div>
              <div className="md-12-3">
                Рейтинг
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
