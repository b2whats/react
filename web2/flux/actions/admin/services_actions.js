'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');
var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

module.exports.get_services_information = () => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .get({type : 'get'})
    .then(response => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kACCOUNT_SERVICES_INFO_LOADED].concat([response]));
    });
};
module.exports.submitCheckbox = (field,selected) => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .post({type : 'set', field : field,selected : selected})
    .then(response => {
    });
};
module.exports.submitMasterName = (names) => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .post({type : 'set', field : 'masters_name',names : names})
    .then(response => {
    });
};
module.exports.submitSubscribe = (words, markup) => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .post({type : 'set', field : 'subscribe', words, markup})
    .then(response => {
    });
};



module.exports.changeOrderType = (type) => {
  return resource(api_refs.kACCOUNT_SERVICES_INFO)
    .post({type : 'set', field : 'order_type',value : type})
    .then(response => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kACCOUNT_SERVICES_CHANGE_ORDER_TYPE].concat([type]));
    });
};
module.exports.checkCodePayment = (code) => {
  return resource(api_refs.kCHECK_CODE_PAYMENT)
    .post({ code })
    .then(response => {
      console.log(response);// eslint-disable-line no-console
      main_dispatcher.fire.apply(main_dispatcher, [event_names.IS_DISCOUNT_CHANGE].concat([response.check]));
    });
};
module.exports.make_payment = (payment_info, payment_method, code) => {
  var w = window.open("","","width=1000,height=700,scrollbars=yes,resizable=yes,");
  return resource(api_refs.kACCOUNT_SERVICES_PAYMENT)
    .post({payment_info, payment_method, code})
    .then(response => {
      w.location = response.payment_url;
      if (response.payment_method.id == 'beznal') {

      } else {
        var check_url = setInterval(() => {

          try {
            if (w.location && w.location.hostname == window.location.hostname || w.closed) {
              clearInterval(check_url);
              w.close();
              module.exports.get_services_information();
            }
          } catch(e) {
            /*Заглушка*/
          }
        }, 500);

      }



    });
};
var actions_ = [
  ['change_step', event_names.kACCOUNT_SERVICES_CHANGE_STEP],
  ['toggle', event_names.kACCOUNT_SERVICES_TOGGLE],
  ['changeTarif', event_names.kACCOUNT_SERVICES_CHANGE_TARIF],
  ['change_brands', event_names.kACCOUNT_SERVICES_CHANGE_BRANDS],
  ['change_services', event_names.kACCOUNT_SERVICES_CHANGE_SERVICES],
  ['change_words', event_names.kACCOUNT_SERVICES_CHANGE_WORDS],
  ['change_markup', event_names.kACCOUNT_SERVICES_CHANGE_MARKUP],
  ['change_payment_method', event_names.kACCOUNT_SERVICES_CHANGE_PAYMENT_METHOD],
  ['changeMasterName', event_names.kACCOUNT_SERVICES_CHANGE_MASTERS_NAME]

];




module.exports = _.extend({}, module.exports, action_export_helper(actions_));

