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
  poi_list: [ {id:1, is_open:false, show_phone:false, marker_color:'red', hint: 'автозапчасть 1', icon_number: 1, coordinates: [55.82, 38.9], company_name:'фирма "Веников не вяжет"', address: 'г.Москва, улица Пржевальского', phone: '+7 926 367 21 00'},
              {id:2, is_open:false, show_phone:false, marker_color:'red', hint: 'автозапчасть 2', icon_number: 2, coordinates: [55.863338, 37.565466], company_name:'Доставка автозапчастей за три часа', address: 'г.Москва, ул. Красноармейского ополчения, дом 4 корпус 1 комната 124', phone: '+7 926 367 21 00'},
              {id:3, is_open:false, show_phone:false, marker_color:'green', hint: 'автозапчасть 3', icon_number: 3, coordinates: [55.763338, 37.265466], company_name:'Лучшие кони на дороге', address: 'г.Москва, Кремль', phone: '+7 926 367 21 00'}]
});



var cncl_ = [
  main_dispatcher
  .on(event_names.kON_TEST_VALUE, value => {  
    var im_value = immutable.fromJS(value);

    if(!immutable.is(state_.poi_list, value)) { //правильная идея НИКОГДА не апдейтить объект если он не менялся
      state_.poi_list_cursor
        .update(() => im_value);
      
      test_store.fire(event_names.kON_CHANGE); //аналогично EVENT слать только в случае если изменения были    
    }
  }, kON_TEST_VALUE__TEST_STORE_PRIORITY),


  main_dispatcher
  .on(event_names.kON_TEST_TOGGLE_BALLOON, id => { 
    var index  = state_.poi_list.findIndex(poi => poi.get('id') === id );
    if (index<0) {
      console.error('poi_list.findIndex returns -1 with id=', id);
    }

    state_.poi_list_cursor
    .update(poi_list => 
      poi_list.map(poi => 
        poi.get('id') === id ? 
          poi.set('is_open', !poi.get('is_open')) : 
          poi.set('is_open', false) ));
    /*
    state_.poi_list_cursor
      .cursor([index])
      .update(poi => poi.set('is_open', !poi.get('is_open')));
    */
    test_store.fire(event_names.kON_CHANGE);
  }, kON_TEST_VALUE__TEST_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_TEST_CLOSE_BALLOON, id => {
    var index  = state_.poi_list.findIndex(poi => poi.get('id') === id );
    if (index<0) {
      console.error('poi_list.findIndex returns -1 with id=', id);
    }

    state_.poi_list_cursor
      .cursor([index])
      .update(poi => poi.set('is_open', false));

    test_store.fire(event_names.kON_CHANGE);
  }, kON_TEST_VALUE__TEST_STORE_PRIORITY),

  main_dispatcher
  .on(event_names.kON_TEST_SHOW_PHONE, id => { 

    var index  = state_.poi_list.findIndex(poi => poi.get('id') === id );
    if (index<0) {
      console.error('poi_list.findIndex returns -1 with id=', id);
    }

    state_.poi_list_cursor
      .cursor([index])
      .update(poi => poi.set('show_phone', true));

    test_store.fire(event_names.kON_CHANGE);
  }, kON_TEST_VALUE__TEST_STORE_PRIORITY)

];


var test_store = merge(Emitter.prototype, {
  get_test_value () {
    return state_.poi_list;
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
