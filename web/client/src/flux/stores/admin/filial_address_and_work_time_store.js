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
var account_page_store = require('stores/account_page_store.js');

var kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY = sc.kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY;

var state_ =  init_state(_.last(__filename.split('/')), {
  address: null,
  coordinates: null,
  metadata: null,
  work_time: [
    {is_holiday: false, from: '09:00', to:'21:00'},
    {is_holiday: false, from: '10:00', to:'18:00'},
    {is_holiday: false, from: '11:00', to:'17:00'}],
  type: 1,
  phones: ['+7','+7', '+7'],
	filial_id: null
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
      update_state_param('phones', init_from.get('phones'));
      update_state_param('work_time', init_from.get('work_time'));

    } else {
      //TODO вот тут проапдейтить если новый - например не резетить work_time
      update_state_param('address', null);
      update_state_param('coordinates', null);
      update_state_param('type', 1);
      update_state_param('phones', ['+7','+7', '+7']);
    }

  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_CURRENT_FILIAL_CHANGE, () => {
		  var current_fillial  = account_page_store.get_current_filial();
		  update_state_param('address', current_fillial.get('city') + ' ' + current_fillial.get('street') + ' ' + current_fillial.get('house'));
		  update_state_param('coordinates', current_fillial.get('coordinates'));
		  update_state_param('type', current_fillial.get('filial_type_id'));
		  update_state_param('phones', current_fillial.get('phones'));
		  update_state_param('work_time', current_fillial.get('operation_time'));
		  update_state_param('filial_id', current_fillial.get('id'));
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY + 1),




  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED, address => {
    update_state_param('address', address);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED, coordinates => {  
    update_state_param('coordinates', coordinates);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_METADATA_CHANGED, metadata => {  
    update_state_param('metadata', metadata);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),


  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED, type => {
    update_state_param('type', type);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED, (index, phone) => {        
    state_.phones_cursor
      .cursor([index])
      .update(() => phone);

    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),





  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_HOLIDAY_CHANGED, (index, value) => {  
    state_.work_time_cursor
      .cursor([index])
      .update(wtime => wtime.set('is_holiday', value));
    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_FROM_CHANGED, (index, value) => {
    state_.work_time_cursor
      .cursor([index])
      .update(wtime => wtime.set('from', value));
    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),

  main_dispatcher
  .on(event_names.kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_TO_CHANGED, (index, value) => {
		  state_.work_time_cursor
      .cursor([index])
      .update(wtime => wtime.set('to', value));
    filial_address_and_work_time_store.fire(event_names.kON_CHANGE);
  }, kON_FILIAL_ADDRESS_AND_WORK_TIME__FILIAL_ADDRESS_AND_WORK_TIME_PRIORITY),








];


var filial_address_and_work_time_store = merge(Emitter.prototype, {
  get_address () {
    return state_.address;
  },
	get_filial_id () {
		return state_.filial_id;
	},

  get_metadata() {
    return state_.metadata;
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

  get_phones() {
    return state_.phones;
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

