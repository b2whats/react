'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
var route_names = require('shared_constants/route_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

var kON_ROUTE_DID_CHANGE__ROUTES_STORE_PRIORITY =  sc.kON_ROUTE_DID_CHANGE__ROUTES_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  route_state: route_names.kROUTE_DEF,
  route_context_params: {},
  route_changed: false,
});

var routes_store_did_change_cncl = main_dispatcher
  .on(event_names.kON_ROUTE_DID_CHANGE, (route_name, route_context, route_params) => {
    //console.log('did_change', route_name);
    var route_context_params = immutable.fromJS(route_params);
    state_.route_changed_cursor
      .update(() => true);
    if (state_.route_state !== route_name) {
      state_.route_state_cursor
        .update(() => route_name);
      routes_store.fire(event_names.kON_CHANGE);
    }
    if (!immutable.is(route_context_params, state_.route_context_params)) {
      state_.route_context_params_cursor
        .update(() => route_context_params);
      routes_store.fire(event_names.kON_CHANGE);
    }
  }, kON_ROUTE_DID_CHANGE__ROUTES_STORE_PRIORITY);


//kON_ROUTE_WILL_CHANGE обработчик ненужен
var routes_store = merge(Emitter.prototype, {
  get_route_changed() {
    return state_.route_changed;
  },
  
  get_route_state_ro () {
    return state_.route_state;
  },

  get_route_context_params () {
    return state_.route_context_params;
  },

  dispose () {
    routes_store_did_change_cncl();
  },

  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = routes_store;
