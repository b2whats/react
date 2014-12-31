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
    
    console.log(111);
    var reload = false;
    var upd = {
      update: function(_window, _resourceURL) {
        console.log("Resource " + _resourceURL + " has just been updated with new content");
        return true;
      },
      contents: fs.readFileSync('./client/' + filepath)
    };

    console.log('-------------------------::::/',filepath);

    if(filepath === 'build/dev/js/app.js') {
      //запустить процесс разбиения на два
      filepath = 'js/app.js';
      //reload = true;
    }

    if(filepath === 'build/dev/lcss/sass.css') {
      //запустить процесс разбиения на два
      filepath = 'lcss/sass.css';
    }

    callback(_.extend({
      reload: reload,
      resourceURL: '/' + filepath,
    }, upd));
  }
);

server.once('ready', function() {
  console.log('Ready!');
});
