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

var kON_REGION__REGION_STORE_PRIORITY = sc.kON_REGION__REGION_STORE_PRIORITY;

var state_ =  init_state(_.last(__filename.split('/')), {
  region_list: [],
  region_current: null,
  region_selection_visible: false,
  show_value: {index:0, search_term:''}
});

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_REGION_LIST_LOADED, region_list => {

        state_.region_list_cursor
      .update(() => immutable.fromJS(region_list));

    region_store.fire(event_names.kON_CHANGE);
  }, kON_REGION__REGION_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_REGION_CHANGED, region_id => {
    //к этому времени список регионов есть всегда
    var region_current = state_.region_list.find(region => {
      return region.get('id') == region_id ||
        region.get('translit_name').toLocaleLowerCase() == region_id.toLocaleLowerCase() ||
        region.get('name').toLocaleLowerCase() == region_id.toLocaleLowerCase();
    });

    if(!immutable.is(state_.region_current, region_current)) {
      state_.region_current_cursor
        .update(() => region_current);

      state_.region_selection_visible_cursor
        .update(() => false);

      region_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были
    }
  }, kON_REGION__REGION_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_CHANGE_REGION_SELECTION, region_selection_visible => {

    if(!immutable.is(state_.region_selection_visible, region_selection_visible)) {
      state_.region_selection_visible_cursor
        .update(() => region_selection_visible);

      state_.show_value_cursor
        .update(v => v.set('index', v.get('index') + 1));

      region_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были
    }
  }, kON_REGION__REGION_STORE_PRIORITY)
];



var region_store = merge(Emitter.prototype, {
  get_region_list () {
    return state_.region_list;
  },
  get_region_current () {
    return state_.region_current;
  },
  get_region_selection_visible() {
    return state_.region_selection_visible;
  },
  get_region_selection_show_value() {
    return state_.show_value; //это хак
  },

  getPriority() {
    return kON_REGION__REGION_STORE_PRIORITY;
  },

  getAll() {
    return state_;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = region_store;