'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');
var point_utils = require('utils/point_utils.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kAUTO_PART_MARKER_COLOR = sass_vars['auto-part-marker-color'];
var kAUTO_PART_MARKER_COLOR_HILITE_MAIN = sass_vars['auto-part-marker-color-hilite-main'];
var kAUTO_PART_MARKER_COLOR_HILITE_SECONDARY = sass_vars['auto-part-marker-color-hilite-secondary'];

var kAUTO_PART_CLUSTER_COLOR = sass_vars['cluster-marker-color'];
var kAUTO_PART_CLUSTER_COLOR_HILITE_MAIN = sass_vars['cluster-marker-color-hilite-main'];


var kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY =  sc.kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  auto_part_data: null,
  results_sorted: null,
  map_center: null,
  map_bounds: null,
  
  page_num: 0,
  items_per_page: 5,
  results_count: 0,

  show_all_phones: false,
});


//пересортировывает результаты в зависимости от удаленности от центра,
//выставляет правильные маркеры
var sort_results_ = (results, center, bounds) => {
  //пока затычка 
  var distance_to_center = (coordinates) => {
    var dx = center.get(0) - coordinates.get(0);
    var dy = center.get(1) - coordinates.get(1);
    return dx*dx + dy*dy;
  };
  
  var map_bounds = state_.map_bounds.toJS();

  var marker_visible = state_.auto_part_data.get('markers').find(marker => marker.get('balloon_visible') === true );
  var marker_visible_id = marker_visible && marker_visible.get('id');
  //сортировка результата по ближайшему маркеру в результате к центру
  return results
    .sortBy(result =>  result.get('markers') //отсортировать по ближайшему маркеру
        .map(marker => 
          distance_to_center(marker.get('coordinates')))
        .min())
    .map(result =>  //поменять main_marker на ближайший
      result
        .set('main_marker', 
          result.get('markers')
            .minBy( marker => 
              distance_to_center(marker.get('coordinates')))))

    .map(result =>  //выставить правильную видимость если открыт балун
      result
        .set('is_balloon_visible_same_address',  marker_visible_id === result.get('main_marker').get('id')))
    .map(result =>  
      result
        .set('markers', 
          result.get('markers')
          .sortBy(m => distance_to_center(m.get('coordinates')))
          .map(m => 
            m.set('visible', point_utils.pt_in_rect(m.get('coordinates').toJS(), map_bounds))
          )));

};


//на основании page_num items_per_page и map_bounds выставить видимые точки
var set_results_and_markers_visibility_ = () => {
  if(!state_.map_bounds) return;
  if(!state_.auto_part_data) return;

  var items_from = state_.items_per_page*state_.page_num;
  var items_to =   state_.items_per_page*(state_.page_num + 1);
  var map_bounds = state_.map_bounds.toJS();
  
  state_.results_sorted_cursor
  .update( results => 
    results
      .map( r => 
        r.set('visible', 
          point_utils.pt_in_rect(r.get('main_marker').get('coordinates').toJS(), map_bounds)))
      .reduce( (memo, r) => (
        {
          list: memo.list.push(r.set('on_current_page', r.get('visible') && memo.index >= items_from && memo.index < items_to )),
          index: memo.index + (r.get('visible') ? 1 : 0) 
        } ), {index:0, list:immutable.List()}).list );

  
  state_.results_count_cursor
    .update( () => state_.results_sorted.count( r => r.get('visible')));


  var id_2_on_page = state_.results_sorted
    .reduce( (memo, r) => {
      if(r.get('on_current_page') === true) {
        memo[r.get('main_marker').get('id')] = 1;
      
        r.get('markers').forEach( m => {
          if(point_utils.pt_in_rect(m.get('coordinates').toJS(), map_bounds)) {
            memo[m.get('id')] = 1;      
          }
        });
      }



      return memo;
    }, {});

  //console.log('id_2_on_page', id_2_on_page);

  state_.auto_part_data_cursor
    .cursor(['markers'])
    .update( markers => 
      markers.map( m => {
        if(m.get('id') in id_2_on_page) {
          if (m.get('on_current_page') !== true) {
            return m.set('on_current_page', true);
          }
        } else {
          if (m.get('on_current_page') !== false) {
            return m.set('on_current_page', false);
          }
        }
        return m;
      }  ));
};


var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_SHOW_ALL_PHONES_ON_CURRENT_PAGE, value => {

    state_.show_all_phones_cursor
      .update( () => value);

    if(value) {
      //пробежать по видимым результатам - маркерам показать телефоны
      var rank_dict = {};
      state_.results_sorted_cursor
        .update( results => 
          results.map( r => {
            if (r.get('on_current_page')) {
              r = r.updateIn(['main_marker'], marker =>  {
                rank_dict[marker.get('rank')] = 1;
                return marker.set('show_phone', true)
              });

              r = r.updateIn(['markers'], markers => 
                markers.map(marker => {
                  rank_dict[marker.get('rank')] = 1;
                  return marker.set('show_phone', true)
                }));
            }
            return r;
          }));

      state_.auto_part_data_cursor
      .cursor(['markers'])
      .update(markers => markers.map(marker => 
        (marker.get('rank') in rank_dict) ? marker.set('show_phone', true) : marker ));

    }

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CHANGE_PAGE, page_num => {

    state_.page_num_cursor
      .update( () => page_num);

/*    state_.show_all_phones_cursor
      .update( () => false); */

    set_results_and_markers_visibility_();  

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  

  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CHANGE_ITEMS_PER_PAGE, items_per_page => {  

    state_.items_per_page_cursor
      .update( () => items_per_page);

    state_.page_num_cursor
      .update( () => 0);
    
/*    state_.show_all_phones_cursor
      .update( () => false);*/

    set_results_and_markers_visibility_();

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  //-------------------------------------------------------------------------------


  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_DATA_LOADED, (auto_part_data) => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(auto_part_data));

    state_.page_num_cursor //выставлять при загрузке 0 страничку
      .update( () => 0);
    
    //state_.show_all_phones_cursor
    //  .update( () => false);

    var user_id_2_markers_list = state_.auto_part_data.get('markers').reduce( (r, m) => {
      var marker_user_id = m.get('user_id');
      if(r.get(marker_user_id) === undefined) r = r.set(marker_user_id, immutable.List([]));
      r = r.updateIn([marker_user_id], list => list.push(m));
      return r;
    }, immutable.fromJS({}));
  

    state_.results_sorted_cursor
    .update( () => 
      state_.auto_part_data.get('results')
        .map( r => 
          r.set('markers', user_id_2_markers_list.get(r.get('user_id')))
           .set('main_marker', user_id_2_markers_list.get(r.get('user_id')).get(0)) ));

    if(state_.map_center !== null) {
      
      state_.results_sorted_cursor
        .update( results_sorted => sort_results_(results_sorted, state_.map_center, state_.map_bounds));

      state_.page_num_cursor
        .update( () => 0);    
      
      //state_.show_all_phones_cursor
      //  .update( () => false);

      set_results_and_markers_visibility_();
    }

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_RESET_DATA, () => {  

    state_.auto_part_data_cursor
      .update(() => immutable.fromJS(null));

    state_.results_sorted_cursor
      .update(() => immutable.fromJS(null));

    state_.results_count_cursor
    .update(() => 0);

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CLOSE_ALL_BALLOON, () => { 
    if(!state_.auto_part_data) return;
    
    state_.auto_part_data_cursor
    .cursor(['markers'])
    .update(markers => markers.map(marker => marker.set('is_open', false)));
  
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  //---------------------------------------------------------------------  
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_TOGGLE_BALLOON, id => { 
    if(!state_.auto_part_data) return;

    if(_.isArray(id)) { //кликнули в кластер - потом разрулю что с этим делать
      var ids = id;
      id = id[0];
    }

    var index  = state_.auto_part_data.get('markers').findIndex(marker => {
      return marker.get('id') === id;
    });

    if (index < 0) {
      
      if(state_.auto_part_data.get('markers').findIndex(marker => marker.get('is_open') === true ) > -1) {
        state_.auto_part_data_cursor
        .cursor(['markers'])
        .update(markers => 
          markers.map(marker => 
            marker.get('is_open') === false ? marker : marker.set('is_open', false)));      
      }

    } else {

      state_.auto_part_data_cursor
      .cursor(['markers'])
      .update(markers => 
        markers.map(marker => 
          marker.get('id') === id ? 
            marker.set('is_open', !marker.get('is_open')) : 
            (marker.get('is_open') === false ? marker : marker.set('is_open', false)) ));

    }


    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_CLOSE_BALLOON, id => {
    if(!state_.auto_part_data) return;

    if(_.isArray(id)) { //закрыли кластер
      var ids = id;
      id = id[0];
    }


    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    state_.auto_part_data_cursor    
      .cursor(['markers', index])
      .update(marker => marker.set('is_open', false));

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  

  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_SHOW_PHONE, id => { 
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    var marker_rank = state_.auto_part_data.get('markers').get(index).get('rank');

    state_.auto_part_data_cursor
      .cursor(['markers'])
      .update(markers => 
        markers.map(marker => 
          marker.get('rank') === marker_rank ? marker.set('show_phone', true) : marker));
    
    state_.results_sorted_cursor
      .update( results => 
        results.map( result => {
          //if(result.get('main_marker').get('id') === id) {
          if(result.get('rank') === marker_rank) {
            result = result.updateIn(['main_marker'], marker =>  marker.set('show_phone', true));

            result = result.updateIn(['markers'], markers => 
              markers.map(marker => 
                marker.set('show_phone', true)));
          }
          return result;
        } ) );


    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),


  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_BALLOON_VISIBLE, (id, visible) => { 
    if(!state_.auto_part_data) return;

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;

    var marker_rank = state_.auto_part_data.get('markers').get(index).get('rank');

    state_.auto_part_data_cursor
      .cursor(['markers', index])
      .update(marker => marker.set('balloon_visible', visible));

    
    state_.results_sorted_cursor
      .update( results => 
        results.map( result => {
          
          if(result.get('rank') === marker_rank) {
            result = result.set('is_balloon_visible_same_rank', visible);
          }
          
          
          if(result.get('main_marker').get('id') === id) {
            result = result.set('is_balloon_visible_same_address', visible);
          }
        

          return result;
        } ) );
    
      

    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),
  
  //---------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_MARKER_HOVER, (id, hover_state, options) => { 

    if(!state_.auto_part_data) return;

    if(_.isArray(id)) {
      var ids = id;
      id = id[0];
    }

    

    var index  = state_.auto_part_data.get('markers').findIndex(marker => marker.get('id') === id );
    if (index < 0) return;
    
    var color = kAUTO_PART_MARKER_COLOR;
    var cluster_color = kAUTO_PART_CLUSTER_COLOR;
    var color_sec = kAUTO_PART_MARKER_COLOR;

    var marker_rank = state_.auto_part_data.get('markers').get(index).get('rank');

    
    if(hover_state) {
      color = kAUTO_PART_MARKER_COLOR_HILITE_MAIN;
      color_sec = kAUTO_PART_MARKER_COLOR_HILITE_SECONDARY;
      cluster_color = kAUTO_PART_CLUSTER_COLOR_HILITE_MAIN;
    }

    state_.auto_part_data_cursor
      .cursor(['markers'])
        .update(markers => 
          markers.map( marker => 
            marker.get('rank') === marker_rank ?
              ( marker.get('id') === id ? 
                  marker.set('marker_color', color).set('cluster_color', cluster_color) : 
                  marker.set('marker_color', color_sec).set('cluster_color', cluster_color)) :
              marker             
          ));

    state_.results_sorted_cursor
      .update( results => 
        results.map( result => {
          
          if(result.get('rank') === marker_rank) {
            result = result.set('is_hovered_same_rank', hover_state);
          }
          
          if ( !(options && options.update_same_address === false) ) {
            if(result.get('main_marker').get('id') === id) {
              result = result.set('is_hovered_same_address', hover_state);
            }
          }

          return result;
        } ) );
    
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

  

  //------------------RESULTS PART------------------------------------------------------
  //------------------------------------------------------------------------------------
  main_dispatcher
  .on(event_names.kON_AUTO_PART_BY_ID_MAP_BOUNDS_CHANGED_BY_USER, (center, zoom, bounds) => { 
    //console.log('bounds', bounds);
    state_.map_center_cursor
      .update(() => immutable.fromJS(center));
    
    state_.map_bounds_cursor
      .update(() => immutable.fromJS(bounds));

    if(!state_.results_sorted) return;

    state_.results_sorted_cursor
      .update( results_sorted => sort_results_(results_sorted, state_.map_center, state_.map_bounds));

    state_.page_num_cursor
      .update( () => 0);
    
/*    state_.show_all_phones_cursor
      .update( () => false); */

    set_results_and_markers_visibility_();  
      
    auto_part_by_id_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_PART_BY_ID__AUTO_PART_BY_ID_STORE_PRIORITY),

];

var auto_part_by_id_store = merge(Emitter.prototype, {
  get_auto_part_data_header () {
    return state_.auto_part_data && state_.auto_part_data.get('header');
  },

  get_auto_part_markers () {
    return state_.auto_part_data && state_.auto_part_data.get('markers');
  },

  get_auto_part_results () {
    return state_.results_sorted;
  },

  get_page_num () {
    return state_.page_num
  },

  get_items_per_page () {
    return state_.items_per_page
  },

  get_results_count () {
    //return state_.results_sorted && state_.results_sorted.size
    return state_.results_count;
  },

  get_map_bounds () {
    return state_.map_bounds;
  },
  
  get_show_all_phones () {
    return state_.show_all_phones;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = auto_part_by_id_store;

