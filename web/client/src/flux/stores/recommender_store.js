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

var uuid = require('node-uuid');

var kON_RECOMMENDER_DATA_LOADED__RECOMMENDER_STORE_PRIORITY =  sc.kON_RECOMMENDER_DATA_LOADED__RECOMMENDER_STORE_PRIORITY; //меньше дефолтной
var kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY =  sc.kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY; //меньше дефолтной


var state_ =  init_state(_.last(__filename.split('/')), { 
  bins: [],
  features_filters: [],
  has_changed: false
});


//-------------===<<<bin helpers
function default_bin(id) {
  return immutable.fromJS({id: id ? id : uuid.v4(), weight:1, features:[], rules:[]});
}

function append_bin(id) {
  state_.bins_cursor
    .update((prev_bins) => prev_bins.push( default_bin(id) ));
}

var recommender_store_did_change_cncl = main_dispatcher
.on(event_names.kON_RECOMMENDER_DATA_SAVED, () => {  

  state_.has_changed_cursor
    .update(() => false);

  recommender_store.fire(event_names.kON_CHANGE);  
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);

//-----------===<<<Event handlers
var recommender_store_did_change_cncl = main_dispatcher
.on(event_names.kON_RECOMMENDER_DATA_LOADED, (features, filters, bins) => {  
  
  //console.log('features[0]', route_context_params, features[1], features[31]);

  state_.features_filters_cursor
    .update(() => immutable.fromJS((features || []).concat(filters || [])));

  //FAKE
  /*
  bins = [{
    id: uuid.v4(),
    title:'ice big bin',
    weight:1,
    features:
      [
        {feature: features[31], weight: 1}, 
        {feature: features[1], weight: 2}], 
    rules:[
        {feature: filters[filters.length - 1], weight: 3},
        {feature: filters[filters.length - 2], weight: 4},
        {feature: features[features.length - 20], weight: 5}
      ]
    }];
  */
  //надо составить список нераспределенных фич - чтобы было видно какие фичи не используются


  state_.bins_cursor
    .update(() => immutable.fromJS(bins || []));

  state_.has_changed_cursor
    .update(() => false);

  recommender_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были  
}, kON_RECOMMENDER_DATA_LOADED__RECOMMENDER_STORE_PRIORITY);



var recommender_store_title_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_TITLE_CHANGED, (bin_id, v) => {  
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);

  if(bin_index===-1) {
    append_bin(bin_id);
    bin_index = state_.bins.size - 1;
  }

  state_.bins_cursor
    .update([bin_index], (prev_bin) => prev_bin.set('title', v));

  state_.has_changed_cursor
    .update(() => true);
  

  recommender_store.fire(event_names.kON_CHANGE);
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);



var recommender_store_weight_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_WEIGHT_CHANGED, (bin_id, weight) => {  
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);

  if(bin_index===-1) {
    append_bin(bin_id);
    bin_index = state_.bins.size - 1;
  }

  if(1*weight===-1) { //удалить корзину
    state_.bins_cursor
      .update(bins => bins.remove(bin_index));
  } else {
    state_.bins_cursor
      .update([bin_index], prev_bin => prev_bin.set('weight', 1*weight));
  }

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);  
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);


var recommender_store_feature_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_FEATURE_CHANGED, (bin_id, feature_index, v) => {
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);

  if(bin_index===-1) {
    append_bin(bin_id);
    bin_index = state_.bins.size - 1;
  }

  if(feature_index >= state_.bins.get(bin_index).get('features').size) {
    state_.bins_cursor
      .getIn([bin_index, 'features'])
      .update(prev_features => prev_features.push( immutable.fromJS({feature:v, weight: 1 }) ));      
  } else {
    state_.bins_cursor
      .getIn([bin_index, 'features', feature_index])
      .update(prev_val => prev_val.set('feature', immutable.fromJS(v)));
  }

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);  
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);


var recommender_store_feature_weight_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_FEATURE_WEIGHT_CHANGED, (bin_id, feature_index, weight) => {  
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);

  if(bin_index===-1) return;
  if(feature_index >= state_.bins.get(bin_index).get('features').size) return;

  if(1*weight===-1) { //удалить фичу    
    state_.bins_cursor
      .getIn([bin_index, 'features'])
      .update(prev_features => prev_features.remove(feature_index));

  } else {
    state_.bins_cursor
      .getIn([bin_index, 'features', feature_index])
      .update(prev_val => prev_val.set('weight', weight));
  }

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);  
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);




var recommender_store_rule_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_RULE_CHANGED, (bin_id, rule_index, v) => {

  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);

  if(bin_index===-1) {
    append_bin(bin_id);
    bin_index = state_.bins.size - 1;
  }

  if(rule_index >= state_.bins.get(bin_index).get('rules').size) {
    state_.bins_cursor
      .getIn([bin_index, 'rules'])
      .update(prev_features => prev_features.push( immutable.fromJS({feature:v, weight: 1 }) ));      
  } else {
    state_.bins_cursor
      .getIn([bin_index, 'rules', rule_index])
      .update(prev_val => prev_val.remove('value').set('feature', immutable.fromJS(v)));
  }

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);



var recommender_store_rule_weight_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_RULE_WEIGHT_CHANGED, (bin_id, rule_index, weight) => {
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);
  if(rule_index >= state_.bins.get(bin_index).get('rules').size) return;

  if(1*weight===-1) { //удалить фичу    
    state_.bins_cursor
      .getIn([bin_index, 'rules'])
      .update(prev_features => prev_features.remove(rule_index));

  } else {
    state_.bins_cursor
      .getIn([bin_index, 'rules', rule_index])
      .update(prev_val => prev_val.set('weight', weight));
  }

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);



var recommender_store_rule_value_did_change_cncl = main_dispatcher
.on(event_names.kON_BIN_RULE_VALUE_CHANGED, (bin_id, rule_index, rule_value) => {
  var bin_index = state_.bins.findIndex(iter_bin => iter_bin.get('id') == bin_id);
  if(rule_index >= state_.bins.get(bin_index).get('rules').size) return;

  state_.bins_cursor
    .getIn([bin_index, 'rules', rule_index])
    .update(prev_val => prev_val.set('value', immutable.fromJS(rule_value) ));

  state_.has_changed_cursor
    .update(() => true);

  recommender_store.fire(event_names.kON_CHANGE);
}, kON_BIN_DATA_CHANGED__RECOMMENDER_STORE_PRIORITY);

//kON_BIN_RULE_VALUE_CHANGED




//-------------===<<<exports

var recommender_store = merge(Emitter.prototype, {
  query_bins () {
    return state_.bins;
  },
  
  query_features() {
    return state_.features_filters;
  },

  has_changed() {
    return state_.has_changed;
  },

  default_bin() {
    return default_bin();
  },

  dispose () {
    recommender_store_title_did_change_cncl();
    recommender_store_weight_did_change_cncl();
    recommender_store_feature_did_change_cncl();
    recommender_store_feature_did_change_cncl ();
    recommender_store_feature_weight_did_change_cncl();
    recommender_store_rule_did_change_cncl();
    recommender_store_rule_weight_did_change_cncl();
    recommender_store_rule_value_did_change_cncl();
  },
  
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = recommender_store;
