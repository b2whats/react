'use strict';
var _ = require('underscore');

module.exports =  function(obj) {
  if (!_.isObject(obj)) return obj;
  var source, prop;
  var length = arguments.length;
  var callback = null;
  if(_.isFunction(arguments[length-1])) {
    --length;
    callback = arguments[length];
  }

  for (var i = 1; i < length; ++i) {
    source = arguments[i];
    for (prop in source) {
      if (Object.prototype.hasOwnProperty.call(source, prop)) {
        if(callback) {
          callback(prop, obj[prop], source[prop]);
        }       
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};