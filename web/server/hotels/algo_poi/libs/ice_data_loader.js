'use strict';
//асинхронная загрузка данных из файлов с разделителями - что позволяет в ноде перегружать данные на лету не тормозя юзерские запросы

var readline = require('readline');
var fs = require('fs');
var q = require('ice_q');
var _ = require('lodash');


module.exports = function(data_file, options) {
  var deferred = q.defer();
  var res_array = [];

  var delimiter = options.d;

  var rl = readline.createInterface({
      input: fs.createReadStream(data_file),
      output: null,
      terminal: false
  });

  var line_index = 0;
  
  rl.on('line', function(line) {
    var line_arr = line.split(delimiter);
    var obj = _.reduce(options.schema, function(memo, opts, key) {
      var d_index = opts[0];

      switch(opts[1]) {
        case 'number':          
          memo[key] = 1*line_arr[d_index];
        break;
        case 'string':
          memo[key] = line_arr[d_index];
        break;
        case 'json':
          memo[key] = JSON.parse(line_arr[d_index]);
        break;
        case 'index':
          memo[key] = line_index;
        break;
        default:
          throw new Error('Unknown type '+opts[1]);
      }
      return memo;
    }, {});

    ++line_index;
    res_array.push(obj);
  });

  rl.on('close', function() {
    deferred.resolve(res_array);
  });
  return deferred.promise;
};


//-----------------------------------------TEST-----------------------------------------------------------------------------------------
if (!module.parent) {
  //пример использования
  var data_schema = {
    index:[0, 'number'],
    name:[1,'string'], 
    country:[2,'string'],
    review_length: [3, 'number'], 
    aspect_data: [4, 'json']
  };
  setTimeout(function(){console.log(0);}, 500);
  setTimeout(function(){console.log(1);}, 1000);
  setTimeout(function(){console.log(2);}, 2000);
  setTimeout(function(){console.log(3);}, 3000);

  module.exports(__dirname + "/../../../../../data/hotels/poi_data.txt", { d: '~', schema: data_schema})
  .then(function(data) {
    console.log(data[0]);
  });
}
