'use strict';
var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY =  sc.kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  width: 0,
  map_visible: false, //видно карту или нет
  map_display: false, //подгружена вообще карта или нет

  star_hover_value: -1,
  star_click_value: 1

});

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_SEARCH_PAGE_SIZE_CHANGED, width => {  
    var im_width = immutable.fromJS(width);

    if(!immutable.is(state_.width, width)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
      state_.width_cursor
        .update(() => im_width);
      
      default_page_size_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
    }
  }, kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_SEARCH_PAGE_CHANGE_MAP_VISIBILITY, map_visible => {      
    if(!immutable.is(state_.map_visible, map_visible)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
      state_.map_visible_cursor
        .update(() => map_visible);

      if(map_visible) { //map_display включаем только один раз
        if(!immutable.is(state_.map_display, map_visible)) {          
          state_.map_display_cursor
            .update(() => map_visible);
        }
      }  
      default_page_size_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
    }
  }, kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_HOVER, star_hover_value => {      
    state_.star_hover_value_cursor
      .update(() => star_hover_value);
    default_page_size_store.fire(event_names.kON_CHANGE);
  }, kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_SEARCH_PAGE_HEADER_RATING_STAR_CLICK, star_click_value => {      
    state_.star_click_value_cursor
      .update(() => star_click_value);
    default_page_size_store.fire(event_names.kON_CHANGE);  
  }, kON_SEARCH_PAGE_SIZE_CHANGED__SEARCH_PAGE_STORE_PRIORITY),
];


var default_page_size_store = merge(Emitter.prototype, {
  get_search_page_width () {
    return state_.width;
  },

  get_search_page_map_visible () {
    return state_.map_visible;
  },
  
  get_search_page_map_display () {
    return state_.map_display;
  },

  get_star_hover_value () {
    return state_.star_hover_value;
  },
  get_star_click_value () {
    return state_.star_click_value;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = default_page_size_store;
