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

var kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY = sc.kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY;




var state_ =  init_state(_.last(__filename.split('/')), {
  values: [],
  first_value: {delta_fix: 0, delta_percent:0},
  price_range_from: 0,
  price_range_to:  150000,

  suppliers: [],
  current_supplier_id: -1,
  price_range: {},
  price_range_info: {},
});


function update_state_param(param_name, value) {
  var im_value = immutable.fromJS(value);

  if(!immutable.is(state_[param_name], im_value)) {
    state_[param_name+'_cursor']
      .update(() => im_value);
    price_list_selector.fire(event_names.kON_CHANGE);
  }
}

var cncl_ = [

  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_INIT_SUPPLIERS, suppliers => {
    update_state_param("suppliers", suppliers);
    if(suppliers.length > 0) {
      update_state_param("current_supplier_id", suppliers[0].id);      
    }
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),
  main_dispatcher
    .on(event_names.kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE, range => {
      if (range) update_state_param("price_range", range);
    }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),
  main_dispatcher
    .on(event_names.kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE_INFO, info => {
      if (info) update_state_param("price_range_info", info);
    }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),
  main_dispatcher
    .on(event_names.kON_PRICE_LIST_SELECTOR_PRICE_RANGE_UPDATE, (id, range) => {


      state_.price_range_cursor
        .update(l => l.set(id + '', immutable.fromJS(range)));

    }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),
  main_dispatcher
    .on(event_names.kON_PRICE_LIST_SELECTOR_PRICE_RANGE_DELETE, (id) => {
      state_.price_range_cursor
        .delete(id+'');

    }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),
  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_CURRENT_SUPPLIER_CHANGED, current_supplier_id => {
    update_state_param("current_supplier_id", current_supplier_id);
    if (state_.price_range_info.has(current_supplier_id + '')) {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED].concat(['discount', state_.price_range_info.get(current_supplier_id + '').get('discount')]));
    }

  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),


  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_RESET, (id) => {

      var id = id + '';
      if (state_.price_range.has(id)) {
        var values =  state_.price_range.get(id).toJS();

      } else {
        var values = [
          {delta_fix: 200, delta_percent: 1}, //значение без price_from это значение наценки для первого интервала цены
        ];
      }

      var first_value = _.find(values, v => v.price_from === undefined);
      values = _.filter(values, v => v.price_from > state_.price_range_from && v.price_from < state_.price_range_to);

      values = _.map(values, v => {
        return _.extend({percent:  100*(v.price_from - state_.price_range_from)/(state_.price_range_to - state_.price_range_from) }, v);
      });



    update_state_param("values", values);
    update_state_param("first_value", first_value);
/*    update_state_param("price_range_from", price_range_from);
    update_state_param("price_range_to", price_range_to);*/
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),

  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION, (index, value) => {

    if(value >= 100) {
      state_.values_cursor
        .update(values => values.filter((v, i) => i!==index));

    } else {
      state_.values_cursor
        .cursor([index])
        .update( v => 
          v.set('percent', value)
          .set('price_from', state_.price_range_from +  value*(state_.price_range_to - state_.price_range_from)/100 ) );
    }

    price_list_selector.fire(event_names.kON_CHANGE);
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),

  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION_BY_PRICE, (index, price_from) => {
    
    if(price_from >= state_.price_range_to) {

      state_.values_cursor
        .update(values => values.filter((v, i) => i!==index));
        
    } else {

      state_.values_cursor
        .cursor([index])
        .update( v => 
          v.set('percent', 100*(price_from - state_.price_range_from) / (state_.price_range_to - state_.price_range_from) )
            .set('price_from', price_from ) );
    }

    price_list_selector.fire(event_names.kON_CHANGE);
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),

  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_ADD_POSITION, (value) => {
    state_.values_cursor
      .update(values => 
        values.push(immutable.fromJS({
          price_from: state_.price_range_from +  value*(state_.price_range_to - state_.price_range_from)/100, 
          delta_fix: state_.first_value.get('delta_fix'), 
          delta_percent: state_.first_value.get('delta_percent'),
          percent: value
        })));
  

    price_list_selector.fire(event_names.kON_CHANGE);
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),

  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_FIX, (index, delta_fix) => {
    if(index >=0) {
      state_.values_cursor
        .cursor([index])
        .update( v => 
          v.set('delta_fix',  delta_fix));
    } else {
      state_.first_value_cursor
        .update( v => 
          v.set('delta_fix',  delta_fix));
    }

    price_list_selector.fire(event_names.kON_CHANGE);
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),


  main_dispatcher
  .on(event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_PERCENT, (index, delta_percent) => {
    if(index >=0) {
      state_.values_cursor
        .cursor([index])
        .update( v => 
          v.set('delta_percent',  delta_percent));
    } else {
      state_.first_value_cursor
        .update( v => 
          v.set('delta_percent',  delta_percent));
    }

    price_list_selector.fire(event_names.kON_CHANGE);
  }, kON_PRICE_LIST_SELECTOR__PRICE_LIST_SELECTOR_PRIORITY),




];


var price_list_selector = merge(Emitter.prototype, {
  get_values () {
    return state_.values;
  },
  
  get_first_value () {
    return state_.first_value;
  },
  get_price_range() {
    return state_.price_range;
  },
  get_price_range_to() {
    return state_.price_range_to;
  },

  get_price_range_from() {
    return state_.price_range_from;
  },

  get_result() {
    return state_.values      
      .push(state_.first_value.set('percent', -1))
      .sortBy(v => v.get('percent'))
      .map(v => v.remove('percent'));
  },

  get_suppliers() {
    return state_.suppliers;
  },

  get_current_supplier_id() {
    return state_.current_supplier_id;
  },

  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = price_list_selector;

