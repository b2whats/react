'use strict';

var _  = require('underscore');
var event_names = require('shared_constants/event_names.js');
var action_export_helper = require('utils/action_export_helper.js');
var sc = require('shared_constants');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var resource = require('utils/resource.js');
var api_refs = require('shared_constants/api_refs.js');

var actions_ = [
  ['update_position', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION],
  ['update_position_by_price', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_POSITION_BY_PRICE],

  ['update_delta_fix', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_FIX],
  ['update_delta_percent', event_names.kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_PERCENT],
  ['add_position', event_names.kON_PRICE_LIST_SELECTOR_ADD_POSITION],
  ['init_suppliers', event_names.kON_PRICE_LIST_SELECTOR_INIT_SUPPLIERS],
  ['init_price_range', event_names.kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE],
  ['init_price_range_info', event_names.kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE_INFO],

  
];


var kTMP_SUPPLIERS = [
  {id:1, title:'Автозапчасти'},
  {id:2, title:'ГиперАвто'},
  {id:3, title:'АвтоМаг'},
];


module.exports.change_current_supplier_id = (id) => {
  main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_CURRENT_SUPPLIER_CHANGED].concat([id]));
  main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_RESET].concat([id]));
};



module.exports.load_price_list_data = () => {
  resource(api_refs.kACCOUNT_MANAGE_WHOLESALE_PRICE_INFO)
    .get({type : 'get'})
    .then(response => {
      module.exports.init_suppliers(response.data.wholesale_list);
      module.exports.init_price_range(response.data.price_range);
      module.exports.init_price_range_info(response.data.info);

      var id = 0;
      if (response.data.wholesale_list.length > 0) {
        id = response.data.wholesale_list[0].id;
        main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_CURRENT_SUPPLIER_CHANGED].concat([id]));
        main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED].concat(['discount', response.data.info[id].discount]));
      }
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_RESET]
        .concat([id]));
    });



};


module.exports.save_result = (current_supplier_id, price_list_data, price_type, price_info) => {
    resource(api_refs.kACCOUNT_MANAGE_WHOLESALE_PRICE_INFO)
    .post({type : 'set', subscription_user : current_supplier_id, range: price_list_data, price_info : price_info })
    .then(response => {
        main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_PRICE_RANGE_UPDATE]
          .concat([current_supplier_id,price_list_data]));
    });
};
module.exports.delete_result = (current_supplier_id) => {
  resource(api_refs.kACCOUNT_MANAGE_WHOLESALE_PRICE_INFO)
    .post({type : 'del', subscription_user : current_supplier_id})
    .then(response => {
      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_RESET]
        .concat([0]));
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kON_PRICE_LIST_SELECTOR_PRICE_RANGE_DELETE]
        .concat([current_supplier_id]));
    });

};





module.exports = _.extend({}, module.exports, action_export_helper(actions_));

