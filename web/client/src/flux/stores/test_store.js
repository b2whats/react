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

var kON_TEST_VALUE__TEST_STORE_PRIORITY =  sc.kON_TEST_VALUE__TEST_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), { 
  value: [{id:1, icon_number: 1, coordinates: [55.82, 38.9], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'},
          {id:2, icon_number: 2, coordinates: [55.863338, 37.565466], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'},
          {id:3, icon_number: 3, coordinates: [55.763338, 37.265466], title:'hi', address: 'улиза Зажопинского', phone: '+7 926 367 21 00'}]
});



var cncl_ = [
  main_dispatcher
  .on(event_names.kON_TEST_VALUE, value => {  
    var im_value = immutable.fromJS(value);

    if(!immutable.is(state_.value, value)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
      state_.value_cursor
        .update(() => im_value);
      
      test_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
    }
  }, kON_TEST_VALUE__TEST_STORE_PRIORITY),


];


var test_store = merge(Emitter.prototype, {
  get_test_value () {
    return state_.value;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = test_store;
