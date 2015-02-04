'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');
var sc = require('shared_constants');
var main_dispatcher = require('dispatchers/main_dispatcher.js');

var actions_ = [
  ['update_position', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION],
  ['update_position_by_price', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION_BY_PRICE],

  ['update_delta_fix', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_FIX],
  ['update_delta_percent', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_PERCENT],
  


];


module.exports.initialize = (values, price_range_from, price_range_to) => {
  if(values === undefined) { //для примера чем инициализировать    
    values = [
    {delta_fix: 200, delta_percent: 1}, //значение без price_from это значение наценки для первого интервала цены
    {price_from: 30000, delta_fix: 200, delta_percent: 1 },
    {price_from: 10000, delta_fix: 200, delta_percent: 1 },
    {price_from: 50000, delta_fix: 200, delta_percent: 1 },
    ];
  }
  
  price_range_from = price_range_from || sc.kPRICE_LIST_SELECTOR_PRICES_FROM;
  price_range_to = price_range_to || sc.kPRICE_LIST_SELECTOR_PRICES_TO;

  var first_value = _.find(values, v => v.price_from === undefined);
  var values = _.filter(values, v => v.price_from > price_range_from && v.price_from < price_range_to);

  values = _.map(values, v => {    
    return _.extend({percent:  100*(v.price_from - price_range_from)/(price_range_to - price_range_from) }, v);
  });

  main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_RESET].concat([values, first_value, price_range_from, price_range_to]));

};


module.exports = _.extend({}, module.exports, action_export_helper(actions_));

