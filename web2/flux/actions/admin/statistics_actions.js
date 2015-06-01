'use strict';

var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');

var merge = require('utils/merge.js');

var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');



var actions_ = [
  [
    'update_form',
    event_names.kON_ON_ACCOUNT_STATISTICS_FORM_UPDATE
  ],
];

module.exports.getStatistics = () => {
  resource(api_refs.STATISTICS)
    .post({requestType: 'get'})
    .then((response) => {
      console.log(response);
      response.status1 = {
        ap: {
          show: [
              {date: '201411', value: 1},
              {date: '201411', value: 3},
              {date: '201411', value: 6},
              {date: '201411', value: 3},
              {date: '201411', value: 4},
              {date: '201411', value: 4},
              {date: '201411', value: 1},
              {date: '201411', value: 3},
              {date: '201411', value: 6},
              {date: '201411', value: 3},
              {date: '201411', value: 4},
              {date: '201411', value: 4},
              {date: '201411', value: 1},
              {date: '201411', value: 3},
              {date: '201411', value: 6},
              {date: '201411', value: 3},
              {date: '201411', value: 4},
              {date: '201411', value: 4},
          ],
          click: [
            {date: '201411', value: 33},
            {date: '201411', value: 123},
            {date: '201411', value: 536},
            {date: '201411', value: 33},
            {date: '201411', value: 472},
            {date: '201411', value: 154},
            {date: '201411', value: 1},
            {date: '201411', value: 3},
            {date: '201411', value: 6},
            {date: '201411', value: 3},
            {date: '201411', value: 4},
            {date: '201411', value: 4},
            {date: '201411', value: 1},
            {date: '201411', value: 3},
            {date: '201411', value: 6},
            {date: '201411', value: 3},
            {date: '201411', value: 4},
            {date: '201411', value: 4},
            {date: '201411', value: 1},
            {date: '201411', value: 3},
            {date: '201411', value: 6},
            {date: '201411', value: 3},
            {date: '201411', value: 4},
            {date: '201411', value: 4},

          ]
        },
        as: {
          click: [
            {date: '201411', value: 31},
            {date: '201411', value: 35},
            {date: '201411', value: 64},
            {date: '201411', value: 32},
            {date: '201411', value: 41},
            {date: '201411', value: 47},
            {date: '201411', value: 14},
            {date: '201411', value: 33},
            {date: '201411', value: 62},
            {date: '201411', value: 31},
            {date: '201411', value: 49},
            {date: '201411', value: 42},
            {date: '201411', value: 17},
            {date: '201411', value: 23},
            {date: '201411', value: 76},
            {date: '201411', value: 23},
            {date: '201411', value: 14},
            {date: '201411', value: 74},
          ],
          show: [
            {date: '201411', value: 3},
            {date: '201411', value: 6},
            {date: '201411', value: 3},
            {date: '201411', value: 4},
            {date: '201411', value: 4},
            {date: '201411', value: 1},
            {date: '201411', value: 3},
            {date: '201411', value: 6},
            {date: '201411', value: 4},
            {date: '201411', value: 4},
            {date: '201411', value: 1},

          ]
        },
        c: {
          click: [
            {date: '201411', value: 3},
            {date: '201411', value: 6},
          ],
          show: [
            {date: '201411', value: 23},
          ]
        }
      };
      let arr = response.status;
      for(var services in arr) {
        for(var type in arr[services]) {
          let info = arr[services][type].map(el => {
            el.date = el.date.substr(0,2) +'-'+ el.date.substr(2,2) +'-'+ el.date.substr(4,2);
            return el;
          });
          arr[services][type] = {};
          let values = info.map(el => el.value);
          let min = Math.min.apply(null, values);
          let max = Math.max.apply(null, values);
          values = info.map(el => (el.value/max));
          arr[services][type].data = values;
          arr[services][type].min = min;
          arr[services][type].max = max;
          arr[services][type].info = info;
          if (type === 'show') {
            arr[services][type].description = "Количество показов";
            arr[services][type].class_name = "my-line-classname";
          }
          if (type === 'click') {
            arr[services][type].description = "Количество кликов";
            arr[services][type].class_name = "my-line2-classname";
          }
          arr[services][type] = (values.length > 0) ? [arr[services][type]] : null;
        }
      }

      main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_ON_ACCOUNT_STATISTICS_LOADED].concat([response.status]));

    })
    .catch(e => {
      console.error(e, e.message);
    })
};

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

