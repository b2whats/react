'use strict';

var resource = require('utils/resource.js');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');
//var q = require('third_party/es6_promise.js');

var r_suggestions_ = resource('/api/suggest/:words');

module.exports.suggest = function(words) {
  return r_suggestions_
  .get({words:words})
  .then(function(res) {
    main_dispatcher.fire.apply (main_dispatcher, [evt.kON_SUGGESTION_DATA_LOADED].concat([res]));
    return res;
  });
};
