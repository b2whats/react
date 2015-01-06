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
var region_store = require('stores/region_store.js');

var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['search-page'];
var kMAP_HEIGHT = style_utils.from_px_to_number( sass_vars['map-height'] );
var kMAP_HEADER_HEIGHT = style_utils.from_px_to_number( sass_vars['map-header-height'] );

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_visible: search_page_store.get_search_page_map_visible (),
  map_display: search_page_store.get_search_page_map_display (),
  width: search_page_store.get_search_page_width (),
  region_current:           region_store.get_region_current ()
}),
search_page_store, region_store /*observable store list*/);

var search_page_actions = require('actions/search_page_actions.js');


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  render () {

    var bounds = null;
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }

    //для не загрузки скриптов яндекс карт YandexMap элемент показываем только когда его первый раз попросят показаться
    //потом тупо играем стилями, отсюда у карты по хорошему два свойства висибл и дисплей
    var class_name_search_page_yandex_map = cx('search-page-yandex-map-block');

    class_name_search_page_yandex_map = this.state.map_visible ? 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-visible') : 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-hidden');


    return (
      <div className={this.props.className}>
        <div className={class_name_search_page_yandex_map}>          
          <SearchPageMapHeaderBlock />
        
          {this.state.map_display && this.state.width>0 && bounds!==null &&
          <YandexMap  
            bounds={bounds}
            height={kMAP_HEIGHT} 
            width={this.state.width}
            header_height={kMAP_HEADER_HEIGHT} />}
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
