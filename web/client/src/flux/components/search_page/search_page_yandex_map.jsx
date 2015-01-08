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
var YandexMapMarker = require('components/yandex/yandex_map_marker.jsx');
var SearchPageMapHeaderBlock = require('./search_page_map_header_block.jsx');
/* jshint ignore:end */

var search_page_store = require('stores/search_page_store.js');
var region_store = require('stores/region_store.js');

var test_store = require('stores/test_store.js');

var test_action = require('actions/test_action.js');

var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['search-page'];
var kMAP_HEIGHT = style_utils.from_px_to_number( sass_vars['map-height'] );
var kMAP_HEADER_HEIGHT = style_utils.from_px_to_number( sass_vars['map-header-height'] );

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_visible: search_page_store.get_search_page_map_visible (),
  map_display: search_page_store.get_search_page_map_display (),
  width: search_page_store.get_search_page_width (),
  region_current:           region_store.get_region_current (), 
  test_value: test_store.get_test_value()
}),
search_page_store, region_store, test_store /*observable store list*/);

var search_page_actions = require('actions/search_page_actions.js');


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  componentWillMount() {
    
    
    setTimeout(() => {    
      
      test_action.test_action(
          [{id:1, show_phone: true, icon_number: 4, coordinates: [55.32, 38.1], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'},
           {id:2, icon_number: 5, coordinates: [55.863338, 37.165466], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'},
           {id:3, icon_number: 3, coordinates: [55.763338, 37.265466], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'}]);

    } , 7000);
    

  },
  render () {

    var YandexMarkers  = this.state.test_value.map(m => 
        <YandexMapMarker 
          key={m.get('id')} 
          id={m.get('id')}
          coordinates={m.get('coordinates').toJS()}
          title={m.get('title')}
          address={m.get('address')}
          icon_number={m.get('icon_number')}
          show_phone={m.get('show_phone')}
          phone={m.get('phone')} />).toJS();

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
            header_height={kMAP_HEADER_HEIGHT}>
              {YandexMarkers}
            </YandexMap>}
        </div>
      </div>
    );
  }
});

module.exports = SearchPageYandexMap;
