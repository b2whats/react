'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var merge = require('utils/merge.js');
var validator = require('revalidator');

var route_actions = require('actions/route_actions.js');
var routes_store = require('stores/routes_store.js');
var modal_actions = require('actions/ModalActions.js');

var region_store = require('stores/region_store.js');

var auth_shema = {
  email: {
    required: true,
    format: 'email',
    messages: {
      format: 'Не верный Email адрес'
    }
  },
  password: {
    required: true,
    allowEmpty: false
  },

};
const changePasswordShema = {
  oldPassword: {
    required: true,
    allowEmpty: false
  },
  newPassword: {
    required: true,
    allowEmpty: false
  }
};


module.exports.submitChangePassword = (passwords) => {
  const shema = {
    properties: changePasswordShema,
  };
  const validation = validator.validate(passwords, shema);
  if (validation.valid) {
    resource(api_refs.kCHANGE_PASSWORD).post(passwords)
      .then(response => {
        if (response.valid) {
          modal_actions.closeModal('changePassword');
          main_dispatcher.fire.apply (main_dispatcher, [event_names.kCHANGE_PASSWORD_SUCCESS].concat([response]));
        } else {
          main_dispatcher.fire.apply (main_dispatcher, [event_names.kCHANGE_PASSWORD_ERROR].concat([response]));
        }

      });
  } else {
    main_dispatcher.fire.apply (main_dispatcher, [event_names.kCHANGE_PASSWORD_ERROR].concat([validation]));
  }
};

var r_auth = resource(api_refs.kAUTH);
module.exports.submit_form = (auth_data) => {
    var shema = {
        properties: auth_shema,
    };
    var validation = validator.validate(auth_data,shema);
    if (validation.valid) {
      r_auth.post(auth_data)
            .then(response => {
              if (response.valid) {
                main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_SUCCESS].concat([response]));
              } else {
                main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_ERROR].concat([response]));
              }

            });
    } else {
        main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_ERROR].concat([validation]));
    }
};

var r_auth_check = resource(api_refs.kAUTH_CHECK);
var r_auth_check_guard_ = r_auth_check.post()
.then(response => {
  if (response.valid) {
    main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_SUCCESS].concat([response]));
  }
  main_dispatcher.fire.apply (main_dispatcher, [event_names.kAUTH_STATUS_CHECK_DONE]);
});
      
module.exports.check_auth = () => {  
  return r_auth_check_guard_;
};

var r_auth_log_out = resource(api_refs.kAUTH_LOG_OUT);
module.exports.log_out = () => {
  r_auth_log_out.post()
    .then(() => {
      main_dispatcher.fire.apply(main_dispatcher, [event_names.kAUTH_STATUS_RESET]);
      route_actions.goto_link_with_default_params('/:region_id',
        {region_id: region_store.get_region_current().get('translit_name')}
      );
    });
};

module.exports.forgotPassword = (mail) => {
  resource(api_refs.kFORGOT_PASSWORD).post({
    email: mail
  }).then(response => {
    // console.log(response);// eslint-disable-line no-console
  });
}


var actions_ = [
    ['reset_form_validate', event_names.kON_FORM_RESET_VALIDATE],
    ['save_path', event_names.kAUTH_SAVE_PATH],
];
module.exports = _.extend({}, module.exports, action_export_helper(actions_));

