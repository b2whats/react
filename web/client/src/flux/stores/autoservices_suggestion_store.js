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

var kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY =  sc.kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
  suggestion_list: [],
  list_state: null,
  search_term: '',
  value: {},
  show_value: {index:0, search_term:''}
});

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED, (suggestion_list, list_state) => {  
    state_.suggestion_list_cursor
      .update(() => immutable.fromJS(suggestion_list));
    
    state_.list_state_cursor
      .update(() => immutable.fromJS(list_state));

    suggestion_store.fire(event_names.kON_CHANGE);
  }, kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED, (value) => {  
    var im_value = immutable.fromJS(value);
    if(!immutable.is(state_.value, im_value)) {
      state_.value_cursor
        .update(() => im_value);

      suggestion_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были 
    }
  }, kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED, (search_term) => {
    var im_search_term = immutable.fromJS(search_term);
    if(!immutable.is(state_.search_term, im_search_term)) {
      state_.search_term_cursor
        .update(() => im_search_term);

      suggestion_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были 
    }
  }, kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED, (show_value) => {
    
      state_.show_value_cursor
        .update(v => v.set('index', v.get('index') + 1).set('search_term', show_value));

      suggestion_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были 

  }, kON_AUTO_SERVICE_SUGGESTION__SUGGESTIONS_STORE_PRIORITY)
];






var suggestion_store = merge(Emitter.prototype, {
  get_suggestion_list () {
    return state_.suggestion_list;
  },
  get_suggestion_list_state () {
    return state_.list_state;
  },
  get_suggestion_value() {
    return state_.value;
  },
  get_suggestion_search_term() {
    return state_.search_term;
  },
  get_suggestion_show_value() {
    return state_.show_value;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = suggestion_store;
