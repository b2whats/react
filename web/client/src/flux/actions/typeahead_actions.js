'use strict';

var resource = require('utils/resource.js');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');
var q = require('third_party/es6_promise.js');

var r_suggestions_ = resource('/api/suggest/:words');



//все вызовы сюда сериализовать иначе возможен мелкий баг
//добавить LRU cache - этот https://github.com/isaacs/node-lru-cache/blob/master/lib/lru-cache.js
module.exports.suggest = function(words, list_state) {
  
  if((''+ (words || '')).trim().length < 1) {    
    return (new q(resolve => resolve([])))
    .then(res => {
      main_dispatcher.fire.apply (main_dispatcher, [evt.kON_SUGGESTION_DATA_LOADED].concat([res, list_state]));
      return res;
    })
    .catch(e => {
      console.error(e, e.stack);
      throw e;
    });
  } else {
    return r_suggestions_
    .get({words:words})
    .then(res => {
      main_dispatcher.fire.apply (main_dispatcher, [evt.kON_SUGGESTION_DATA_LOADED].concat([res, list_state]));
      return res;
    })
    .catch(e => {
      console.error(e, e.stack);
      throw e;
    });
  }

};
