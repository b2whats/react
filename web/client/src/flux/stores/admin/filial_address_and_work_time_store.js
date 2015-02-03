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

var kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY = sc.kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY;

var state_ =  init_state(_.last(__filename.split('/')), {
  address: null,
  coordinates: null,
  work_time: [],
  type: 1,
  phone: '+7'
});

function update_state_param(param_name, value) {
  var im_value = immutable.fromJS(value);

  if(!immutable.is(state_[param_name], im_value)) {
    state_[param_name+'_cursor']
      .update(() => im_value);
    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }
}

var cncl_ = [
  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_RESET, init_from => {  
    
    if(init_from) {
      //TODO вот тут проапдейтить если апдейт
      update_state_param('address', init_from.get('address'));
      update_state_param('coordinates', init_from.get('coordinates'));
      update_state_param('type', init_from.get('type'));
      update_state_param('phone', init_from.get('phone'));
      update_state_param('work_time', init_from.get('work_time'));

    } else {
      //TODO вот тут проапдейтить если новый - например не резетить work_time
      update_state_param('address', null);
      update_state_param('coordinates', null);
      update_state_param('type', 1);
      update_state_param('phone', '+7');
    }

  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED, address => {
    update_state_param('address', address);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED, coordinates => {  
    update_state_param('coordinates', coordinates);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED, type => {
    update_state_param('type', type);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED, phone => {  
    update_state_param('phone', phone);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),





  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_APPEND, region_list => {  

    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_REMOVE, region_list => {  

    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


];


var filial_address_and_work_time_store = merge(Emitter.prototype, {
  get_address () {
    return state_.address;
  },

  get_coordinates () {
    return state_.coordinates;
  },

  get_work_time () {
    return state_.work_time;
  },
  
  get_type() {
    return state_.type;
  },

  get_phone() {
    return state_.phone;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = filial_address_and_work_time_store;
