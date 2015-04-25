'use strict';
var _ = require('underscore');

var create_indexed_bind = () => {
  var memoize_ = {};

  return (fn, index) => {
    if(!(index in memoize_)) {
     memoize_[index] = _.bind(fn, null, index); 
    }
    return memoize_[index];
  };
};

module.exports.create_indexed_bind = create_indexed_bind;
