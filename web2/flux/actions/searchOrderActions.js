import mainDispatcher from 'dispatchers/main_dispatcher.js';
import eventNames from 'shared_constants/event_names.js';
import apiRefs from 'shared_constants/api_refs.js';
import resource from 'utils/resource.js';
import actionExportHelper from 'utils/action_export_helper.js';
import validator from 'revalidator';

module.exports.submit = (orderInfo) => {
  const shema = {
    properties: {
      name: {
        required: true,
        allowEmpty: false
      },
      email: {
        required: true,
        format: 'email',
        messages: {
          format: 'Не верный Email адрес'
        }
      },
      phone: {
        required: true,
        allowEmpty: false
      },
      comment: {
        required: true,
        allowEmpty: false
      }
    }
  };
  let validation = validator.validate(orderInfo.sender, shema);
  if (validation.valid) {
    orderInfo.subject.addresses = null;
    resource(apiRefs.kSUBMIT_ORDER)
      .post(orderInfo)
      .then(response => {
        // console.log('response');
        if (!response.valid) {
          mainDispatcher.fire.apply(mainDispatcher, [eventNames.K_ON_ORDER_VALIDATION_ERROR].concat([response]));
        } else {
          mainDispatcher.fire.apply(mainDispatcher, [eventNames.K_ON_ORDER_VALIDATION_SUCCESS].concat([orderInfo.sender]));
          mainDispatcher.fire.apply(mainDispatcher, [eventNames.kON_MODAL_HIDE]);
        }
      });
  } else {
    mainDispatcher.fire.apply(mainDispatcher, [eventNames.K_ON_ORDER_VALIDATION_ERROR].concat([validation]));
  }
};
const actions_ = [
  ['resetValidation', eventNames.K_ON_ORDER_VALIDATION_RESET]
];

module.exports = Object.assign({}, module.exports, actionExportHelper(actions_));

