'use strict';
var _ = require('underscore');
var path = require('path');
var flo = require('fb-flo');
var fs = require('fs');



//flo смотрит в билд папку и в папку assets
//если в одной из них что то изменилось - обновляет браузер
var server = flo(
  './client',
  {
    port: 3082,
    host: '0.0.0.0',
    verbose: false,
    glob: [
      'assets/css/*.css',
      'build/dev/js/app.js',
      'build/dev/lcss/*.css'
    ]
  },
  function resolver(filepath, callback) {
    
    var upd = {
      update: function(_window, _resourceURL, param) {
        // this function is executed in the browser, immediately after the resource has been updated with new content perform additional steps here to reinitialize your application so it would take advantage of the new resource
        console.log("Resource " + _resourceURL + " has just been updated with new content");
        console.log(param);
      },
      contents: fs.readFileSync('./client/' + filepath)
    };

    console.log('-------------------------::::/',filepath);
    if(filepath === 'build/dev/js/app.js') {
      //запустить процесс разбиения на два
      filepath = 'js/app.js';
    }

    callback(_.extend({
      resourceURL: '/' + filepath,
    }, upd));
  }
);

server.once('ready', function() {
  console.log('Ready!');
});
