'use strict';
var q = require('third_party/es6_promise.js');

var promise_serializer = require('utils/promise_serializer.js');
var serializer = promise_serializer.create_serializer();

var memoize = require('utils/promise_memoizer.js');
var kMEMOIZE_OPTIONS = {expire_ms: 60*15*1000, cache_size_power: 0, max_items_per_hash: 1};



var memoized_call_ = memoize(() => {

  return new q(function(resolve, reject) {
    if (typeof window === 'undefined') {
      console.error('object window not defined');
      reject(new Error('object window not defined'));    
    }

    if (typeof window.$script === 'undefined') {
      console.error('you need to include scriptjs library at the beggining of html');
      reject(new Error('you need to include scriptjs library at the beggining of html'));
    }

    //сначала ждем когда загружающий ya скрипт загрузится, потом когда он сам все подгрузит
    $script('//api-maps.yandex.ru/2.1/?lang=ru-RU', function() {
      if (typeof window.ymaps === 'undefined') {
        console.error('ymaps not loaded');
        reject(new Error('ymaps not loaded'));
      } else {        
        window.ymaps.ready(() => resolve(window.ymaps));
      }
    });
  });
}, kMEMOIZE_OPTIONS);

module.exports.get_ymaps_promise = () => {
  return serializer(memoized_call_);
};


