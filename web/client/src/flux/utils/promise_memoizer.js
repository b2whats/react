'use strict';
/**
 * promise memoize 
*/
var _ = require('underscore');
var immutable = require('immutable');
var q = require('third_party/es6_promise.js');


var hash_code = function(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var create_memoizer = (fn, options) => {
  var {cache_size_power, expire_ms, max_items_per_hash} = _.extend({cache_size_power: 8, expire_ms: 60*15*1000, max_items_per_hash: 4}, options);

  var cache_size = Math.pow(2, cache_size_power);
  var cache_ = new Array(cache_size);
  var mask_ = cache_size - 1;

  var peek = (hash, im) => {
    if(hash in cache_) {
      var hash_array = cache_[hash];
      var item = _.find(hash_array, (v) => immutable.is(v.im, im));
      if (item !== undefined) {
        var curr_dt = (new Date()).getTime();
        if (curr_dt - item.dt < expire_ms) {
          return item;
        } else { //подчистить массив если проикспарился
          var index = _.indexOf(hash_array, item);
          hash_array.splice(index, 1);
        }
      }
    }
  };

  var put = (hash, im, result) => {
    if(!(hash in cache_)) cache_[hash] = [];
    var hash_array = cache_[hash];    
    var curr_dt = (new Date()).getTime();

    var item = peek(hash, im);
    
    if (item!==undefined) {
      item.dt = curr_dt;
      item.result = result;
      //пересортировать
      cache_[hash] = _.sortBy(hash_array, (v) => v.dt);
    } else {
      item = {dt: curr_dt, im: im, result: result};
      
      if(hash_array.length>=max_items_per_hash) {
        hash_array.shift(); //убрать самый старый элемент
      }        
      hash_array.push(item);
    }
  };

  return () => {
    var args = [].slice.call(arguments);
    var im = immutable.fromJS(args);
    var hash = hash_code(im.toString()) & mask_;
    
    var item = peek(hash, im);
  
    if(item !== undefined) { //есть в кеше вернем
      return new q((r) => r(item.result));
    } else {
      return fn.apply(null, args)
      .then(r => {
        put(hash, im, r);
        return r;
      });
    }
  };
};

module.exports = create_memoizer;
