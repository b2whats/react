const $script = require('scriptjs');
// const sc = require('shared_constants');


const serialize = require('utils/promise_serializer_new.js');
const memoize = require('utils/promise_memoizer_new.js');

const K_MEMOIZE_OPTIONS = {expire_ms: 365 * 24 * 60 * 1000, cache_size_power: 0, max_items_per_hash: 1};


const memoizedCall_ = serialize(memoize(K_MEMOIZE_OPTIONS)((apiKey) => {
  return new Promise((resolve, reject) => {
    if (typeof window._$_google_map_initialize_$_ !== 'undefined') {
      console.error('bad initialization');  // eslint-disable-line no-console
      reject(new Error('bad initialization'));
    }

    window._$_google_map_initialize_$_ = () => {
      delete window._$_google_map_initialize_$_;
      resolve(window.google.maps);
    };

    const apiKeyString = apiKey ? `&key=${apiKey}` : '';
    // сначала ждем когда загружающий ya скрипт загрузится, потом когда он сам все подгрузит ?v=3.exp
    $script(`https://maps.googleapis.com/maps/api/js?callback=_$_google_map_initialize_$_${apiKeyString}`, () => {
      if (typeof window.google === 'undefined') {
        console.error('gmap not loaded');  // eslint-disable-line no-console
        reject(new Error('gmap not loaded'));
      }
    });
  });
}));

module.exports = (...args) => {
  return memoizedCall_(...args);
};
