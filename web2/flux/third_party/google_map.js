'use strict';
var q = Promise;
var $script = require('scriptjs');
var sc = require('shared_constants');

var promise_serializer = require('utils/promise_serializer.js');
var serializer = promise_serializer.create_serializer();

var memoize = require('utils/promise_memoizer.js');
var kMEMOIZE_OPTIONS = {expire_ms: 365*24*60*1000, cache_size_power: 0, max_items_per_hash: 1};



var memoized_call_ = memoize(() => {

  return new q(function(resolve, reject) {
    if(typeof window._$_google_map_initialize_$_ !== 'undefined') {
      console.error('bad initialization');
      reject(new Error('bad initialization'));
    }

    window._$_google_map_initialize_$_ = () => {
      delete window._$_google_map_initialize_$_;
      resolve(window.google.maps);
    };

    //сначала ждем когда загружающий ya скрипт загрузится, потом когда он сам все подгрузит ?v=3.exp
    $script(`https://maps.googleapis.com/maps/api/js?callback=_$_google_map_initialize_$_&key=${sc.kGOOGLE_MAP_API_KEY}`, function() {
      if (typeof window.google === 'undefined') {
        console.error('gmap not loaded');
        reject(new Error('gmap not loaded'));
      }
    });
  });
}, kMEMOIZE_OPTIONS);

module.exports = () => {
  return serializer(memoized_call_);
};
