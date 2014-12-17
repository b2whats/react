'use strict';

var fs = require('fs');

module.exports = function(icon_path) {
  var txt = fs.readFileSync(icon_path, 'utf8');
  var re = /\.flaticon-([a-zA-Z-_]+):.*\n.*content:\s"\\(.*)"/ig;
  var map_name_to_icon_font_code = {};
  var match;
  while((match = re.exec(txt))!==null) {
    //console.log(match[1], match[2]);
    map_name_to_icon_font_code[ match[1] ] = match[2];
  }
  return map_name_to_icon_font_code;
};















