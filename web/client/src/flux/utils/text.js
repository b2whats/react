'use strict';


var re_not = /[^а-яА-ЯёЁa-zA-Z0-9]+/ig;

var create_selection_replacer = (str) => {
  var splitted = str.split(re_not);
  var re = new RegExp('((?:'+splitted.join(')|(?:')+'))', 'ig');
  return (txt) =>  txt.replace(re, '<strong>$1</strong>');
};

module.exports.create_selection_replacer = create_selection_replacer;
