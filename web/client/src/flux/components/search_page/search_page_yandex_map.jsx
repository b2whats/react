'use strict';

//var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var YandexMap = require('components/yandex/yandex_map.jsx');
var YandexMapMarker = require('components/yandex/yandex_map_marker.jsx');

/* jshint ignore:end */

var search_page_store = require('stores/search_page_store.js');
var region_store = require('stores/region_store.js');
var test_store = require('stores/test_store.js');

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');
var autoservice_by_id_store = require('stores/autoservice_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
var autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');


var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['search-page'];
//var kMAP_HEIGHT = style_utils.from_px_to_number( sass_vars['map-height'] ); //jshint ignore:line
var kMAP_HEADER_HEIGHT = 0;//style_utils.from_px_to_number( sass_vars['map-header-height'] ); //jshint ignore:line
var kMAP_PERCENT_WIDTH = style_utils.from_percent_to_number( sass_vars['left-block-width'] );


var ymap_baloon_template =  require('./templates/yandex_baloon_template.jsx');
var ymap_cluster_baloon_template = require('./templates/yandex_cluster_baloon_template.jsx');
var yandex_templates_events = require('./templates/yandex_templates_events.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  map_visible: search_page_store.get_search_page_map_visible (),
  map_display: search_page_store.get_search_page_map_display (),
  height: search_page_store.get_search_page_height (),
  width: search_page_store.get_search_page_width (),
  region_current:           region_store.get_region_current (), 
  test_value: test_store.get_test_value(),
  auto_part_markers: auto_part_by_id_store.get_auto_part_markers(),
  autoservice_markers: autoservice_by_id_store.get_autoservice_markers()
  
}),
search_page_store, region_store, test_store, auto_part_by_id_store, autoservice_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');


var SearchPageYandexMap = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  on_marker_click(id) {
    //test_action.test_action_toggle_balloon(id);
    auto_part_by_id_actions.auto_part_toggle_balloon(id);
    autoservice_by_id_actions.autoservice_toggle_balloon(id);
  },
  
  on_marker_hover(id, hover_state) {
    auto_part_by_id_actions.auto_part_marker_hover(id, hover_state);
    autoservice_by_id_actions.autoservice_marker_hover(id, hover_state);
  },

  on_close_ballon_click(id) {
    //test_action.test_action_close_balloon(id);
    auto_part_by_id_actions.auto_part_close_balloon(id);
    autoservice_by_id_actions.autoservice_close_balloon(id);
  },

  on_balloon_event(event_name, id) {
    if(event_name === yandex_templates_events.kON_SHOW_PHONE_CLICK) {
      auto_part_by_id_actions.auto_part_show_phone(id);
      autoservice_by_id_actions.autoservice_show_phone(id);
    } else 
    if (event_name === yandex_templates_events.kON_BALLOON_VISIBLE) {      
      
      auto_part_by_id_actions.auto_part_balloon_visible(id, true);
      auto_part_by_id_actions.auto_part_show_phone(id)
      
      autoservice_by_id_actions.autoservice_balloon_visible(id, true);      
      //autoservice_by_id_actions.autoservice_show_phone(id);
    
    } else
    if (event_name === yandex_templates_events.kON_BALLOON_HIDDEN) {      
      auto_part_by_id_actions.auto_part_balloon_visible(id, false);
      autoservice_by_id_actions.autoservice_balloon_visible(id, false);
    }
  },

  on_bounds_change (center, zoom, bounds) { //это событие по крайней мере старается вызываться только когда реально идут юзерские изменения
    //console.log('AA:on_bounds_change', center, zoom);
    auto_part_by_id_actions.auto_part_map_bounds_changed_by_user(center, zoom, bounds);
    autoservice_by_id_actions.autoservice_map_bounds_changed_by_user(center, zoom, bounds);
  },

  render () {
    var bounds = null; //меняется при переключении региона, юзерские не отслеживаются
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }
    
    //для не загрузки скриптов яндекс карт YandexMap элемент показываем только когда его первый раз попросят показаться
    //потом тупо играем стилями, отсюда у карты два свойства висибл и дисплей
    var class_name_search_page_yandex_map = cx('search-page-yandex-map-block');

    class_name_search_page_yandex_map = this.state.map_visible ? 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-visible') : 
      cx(class_name_search_page_yandex_map,'search-page-yandex-map-map-hidden');

    /* jshint ignore:start */
    var YandexAutoPartsMarkers  = this.state.auto_part_markers && this.state.auto_part_markers.map(m => //this.state.test_value.map(m => //
        <YandexMapMarker 
          key={m.get('id')} 
          {...m.toJS()} />).toJS() || [];

    var YandexAutoServiceMarkers  = this.state.autoservice_markers && this.state.autoservice_markers.map(m => //this.state.test_value.map(m => //
        <YandexMapMarker 
          key={m.get('id')} 
          {...m.toJS()} />).toJS() || [];


    return (
      <div className={this.props.className}>
        <div className={class_name_search_page_yandex_map}>                  
          {this.state.map_display && this.state.width>0 && bounds!==null &&
          <YandexMap  
            bounds={bounds}
            height={this.state.height} 
            width={this.state.width * kMAP_PERCENT_WIDTH/100}
            header_height={kMAP_HEADER_HEIGHT}
            baloon_template={ymap_baloon_template}
            cluster_baloon_template={ymap_cluster_baloon_template}
            on_marker_click={this.on_marker_click}
            on_marker_hover={this.on_marker_hover}
            on_close_ballon_click={this.on_close_ballon_click} 
            on_balloon_event={this.on_balloon_event}
            on_bounds_change={this.on_bounds_change}>
              
              {YandexAutoServiceMarkers}
              {YandexAutoPartsMarkers}
          
          </YandexMap>}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = SearchPageYandexMap;
