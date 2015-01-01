'use strict';
var _ = require('underscore');
//var path = require('path');
var flo = require('fb-flo');
var fs = require('fs');
var q = require('q');
var multiline = require('multiline');

var qread = q.denodeify(fs.readFile);
var bash_create = require('ice_bash_exec')(__dirname);

var exorcist = bash_create(['FILE_WITH_MAP', 'APP_JS', 'APP_JS_MAP'], multiline.stripIndent(function() {/*
  cat "$FILE_WITH_MAP" | ./node_modules/exorcist/bin/exorcist.js  "$APP_JS_MAP" > "$APP_JS"
*/})
);


//flo смотрит в билд папку и в папку assets
//если в одной из них что то изменилось - обновляет браузер
//одновременно использую на применение екзорциста на вачифай билд
var server = flo(
  './client',
  {
    port: 3082,
    host: '0.0.0.0',
    verbose: false,
    glob: [
      'assets/css/*.css',
      //'build/dev/js/app.js',
      'build/dev/js/map.app.js',
      'build/dev/lcss/sass.css'
    ]
  },
  function resolver(filepath, callback) {


    console.log('-------------------------::::/',filepath);
    
    var upd = {
      update: function(_window, _resourceURL) {
        console.log('Resource ' + _resourceURL + ' has just been updated with new content');
      }
    };

    var kBUILD_DIR = 'build/dev';


    ((function() {
      if(filepath === 'build/dev/js/map.app.js') {
        return exorcist('./client/build/dev/js/map.app.js', './client/build/dev/js/app.js', './client/build/dev/js/app.js.map')
        .then(function() {
          console.log('exorcist done');
          return q.all([qread('./client/build/dev/js/app.js')/*, qread('./client/build/dev/js/app.js.map')*/]);
        })
        .then(function(contents) {
          console.log('file readed done');
          return [
            {
              contents: contents[0],
              reload: false,
              resourceURL: '/js/app.js'
            }
            /*
            ,
            {
              contents: contents[1],
              reload: false,
              resourceURL: '/js/app.js.map'
            }
            */
          ];

        });
      } else {
        return qread('./client/' + filepath)
        .then(function(content) {
          var local_path = filepath.indexOf(kBUILD_DIR)===0 ? filepath.substring(kBUILD_DIR.length + 1) : filepath;
          return {
            contents: content,
            reload: false,
            resourceURL: '/'+local_path
          };
        });
      }
    })())
    .then(function(obj){
      if(_.isArray(obj)) {
        _.each(obj, function(o) {
          callback(_.extend({}, upd, o)); 
        });
        
      } else {
        callback(_.extend({}, upd, obj)); 
      }
    
    })
    .catch(function(e) {
      console.error('-----------------------FB-FLO-ERROR---------------------------------');
      console.error(e);
    })
    .done();


  }
);

server.once('ready', function() {
  console.log('Ready!');
});
