'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');
var immutable = require('immutable');

var validator = require('revalidator');
var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var sass_vars = require('common_vars.json')['yandex-map'];



module.exports.get_company_information = (id) => {
  return resource(api_refs.GET)
    .post({company_by_id: id, company_filials_by_company_id: id, reviews_by_company_id: id})
    .then(response => {

      // пока задать детерминированную сортировку
      const hashCode = function calcHashCode(str) {
        let hash = 0;
        let i;
        let chr;
        let len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };



      // console.log(results[0]);
      let markers = [];
      markers.push(response.results.company);

      const results = markers
        .map(result => Object.assign({visible_item: true, sort: hashCode(result.name) & 0xF}, result, {addresses: response.results.company_filials.map(el => {
          el.visible_address = true;
          return el
        })}));

      main_dispatcher.fire.apply(main_dispatcher, [event_names.kPERSONAL_PAGE_MAP_LOADED].concat([results]));
      response.status && main_dispatcher.fire.apply(main_dispatcher, [event_names.kPERSONAL_COMPANY_INFO_LOADED].concat([response['results']]));
    })
    .catch(e => console.error(e, e.stack));
};

var user_shema = {
  email: {
    required: true,
    format: 'email',
    messages: {
      format: 'Не верный Email адрес'
    }
  },
  name: {
    required: true,
    allowEmpty: false
  },
  comment: {
    required: true,
    allowEmpty: false
  },
  rating: {
    required: true,
    allowEmpty: false
  },
};

module.exports.submit_form = (comment, company_id, parent) => {
  var shema = {
    properties: user_shema,
  };

  main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_COMMENT_STATUS_RESET]);
  var validation = validator.validate(comment, shema);
  if (validation.valid) {
    resource(api_refs.kSUBMIT_COMMENT_DATA)
      .post({comment: comment, company_id: company_id, parent: parent})
      .then(response => {

        response['status'] && main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_COMMENT_SUCCESS].concat([response['results']]));
      })
      .catch(e => console.error(e, e.stack));
  }
  else {
    main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_COMMENT_STATUS_ERROR].concat([validation]));
  }
};
module.exports.submit_answer = (comment_id, comment) => {
  resource(api_refs.kSUBMIT_COMMENT_DATA)
    .post({comment: comment, comment_id: comment_id})
    .then(response => {
      response['status'] && main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_ANSWER_SUCCESS].concat([comment_id,
                                                                                                                     response['results']]));
    });

};

var actions_ = [
  ['update_form', event_names.COMMENT_FORM_UPDATE],
  ['mapBoundsChange', event_names.K_ON_COMPANY_MAP_NEW_MAP_BOUNDS_CHANGE],
  ['visibleRowsChange', event_names.K_ON_COMPANY_MAP_VISIBLE_ROWS_CHANGED],
  ['rowHover', event_names.K_ON_COMPANY_MAP_ROW_HOVER],
  ['rowMapHover', event_names.K_ON_COMPANY_MAP_MAP_ROW_HOVER],
  ['rowAddressActive', event_names.K_ON_COMPANY_MAP_ROW_ADDRESS_ACTIVE],
];

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

