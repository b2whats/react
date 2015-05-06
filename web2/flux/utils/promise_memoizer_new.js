/**
 * promise memoize
*/
const _ = require('underscore');
const immutable = require('immutable');

function hashCode(str) {
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
}

function memoize(options) {
  return fn => {
    const {cache_size_power, expire_ms, max_items_per_hash} = Object.assign({cache_size_power: 8, expire_ms: 60 * 15 * 1000, max_items_per_hash: 4}, options);

    const cacheSize = Math.pow(2, cache_size_power);
    const cache_ = new Array(cacheSize);
    const mask_ = cacheSize - 1;

    const peek = (hash, im) => {
      if (hash in cache_) {
        const hashArray = cache_[hash];
        const item = _.find(hashArray, (v) => immutable.is(v.im, im));
        if (item !== undefined) {
          const currDt = (new Date()).getTime();
          if (currDt - item.dt < expire_ms) {
            return item;
          }

          const index = _.indexOf(hashArray, item);
          hashArray.splice(index, 1);
        }
      }
    };

    const put = (hash, im, result) => {
      if (!(hash in cache_)) cache_[hash] = [];
      const hashArray = cache_[hash];
      const currDt = (new Date()).getTime();

      let item = peek(hash, im);

      if (item!==undefined) {
        item.dt = currDt;
        item.result = result;
        //пересортировать
        cache_[hash] = _.sortBy(hashArray, (v) => v.dt);
      } else {
        item = {dt: currDt, im: im, result: result};

        if (hashArray.length >= max_items_per_hash) {
          hashArray.shift(); //убрать самый старый элемент
        }
        hashArray.push(item);
      }
    };

    return (...args) => {
      const im = immutable.fromJS(args);
      const hash = hashCode(im.toString()) & mask_;

      const item = peek(hash, im);

      if (item !== undefined) { //есть в кеше вернем
        return new Promise((r) => r(item.result));
      }

      return fn.apply(null, args)
      .then(r => {
        put(hash, im, r);
        return r;
      });
    };
  };
}


module.exports = memoize;
