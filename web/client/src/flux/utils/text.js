'use strict';

var _ = require('underscore');

var re_not_ = /[^а-яА-ЯёЁa-zA-Z0-9]+/ig;
var re_not_link_ = /[^а-яА-ЯёЁa-zA-Z0-9_-]+/ig;


var create_selection_replacer = (str) => {
  var splitted = str.split(re_not_);
  var re = new RegExp('((?:'+splitted.join(')|(?:')+'))', 'ig');
  return (txt) =>  txt.replace(re, '<strong>$1</strong>');
};

module.exports.create_selection_replacer = create_selection_replacer;

module.exports.remove_tags = (value) => {
  var re = /<(.|\n)*?>/ig;
  return value.replace(re, '');
};

module.exports.encode_object_properties = (obj) => {
  return _.reduce(obj, (memo, v, k) => {
    memo[k] = _.isString(v) ? encodeURIComponent(v) : v;
    return memo;
  }, {});
};

module.exports.encode_link_object_properties = (obj) => {
  return _.reduce(obj, (memo, v, k) => {
    memo[k] = _.isString(v) ? encodeURIComponent(v.replace(re_not_link_, '_')) : v;
    return memo;
  }, {});
};

//re_not_link_