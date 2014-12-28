'use strict';
var _ = require('underscore');
var memoize = require('utils/promise_memoizer.js');

var q = require('third_party/es6_promise.js');

var query = (x) => (new q(function(res, rej){
  setTimeout(() => res(x) , 500);
  }))
  .then((x) => {
    console.log('h=',x);
    return x;
  });

/*
var memoized_query = memoize(query, 2, 3000)

memoized_query(1).then(r => console.log('t_0=',r));


setTimeout(() => memoized_query(1).then(r => console.log('t_1=',r)), 1000);

setTimeout(() => memoized_query(1).then(r => console.log('t_2=', r)), 5000);
*/

//var hash_keys = _.map(_.range(0, 100), (i) => prom(8)(i));
//var uniq = _.uniq(hash_keys);

//console.log('UNIQ =', uniq.length, 'REL =', hash_keys.length);



