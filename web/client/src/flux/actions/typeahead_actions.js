'use strict';

var _ = require('underscore');
var resource = require('utils/resource.js');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var evt = require('shared_constants/event_names.js');
var q = require('third_party/es6_promise.js');

//var r_suggestions_ = resource('/api/suggest/:words');

var r_suggestions_ = resource('http://autogiper.com/api/search.php?autoparts=:words')
//cors настройки тут http://enable-cors.org/server_nginx.html

//http://autogiper.com/api/search.php?autoparts=%D0%A0%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%20%D1%82%D0%BE%D0%BF
//http://autogiper.com/api/search.php?autoparts=%D0%A0%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%20%D1%82%D0%BE%D0%BF


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
    .then(function(sugg_list) {
      return _.map(sugg_list,  x => [x['id'], x['code'], x['manufacturer'], x['name']]);
    })
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
