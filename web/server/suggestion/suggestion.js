'use strict';
/*globals __config*/
var config = require(__config+'config.js');

var express = require('express');
var _ = require('underscore');

var q = require('ice_q');
var fs = require('fs');
var qwrite = q.denodeify(fs.writeFile);
var qread = q.denodeify(fs.readFile);


var ice_middlewares = require('ice_middlewares');

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}


var kLINE_ID = 0;
var kLINE_ARTICUL = 1;
var kLINE_PRODUCER = 2;
var kLINE_SENTENCE_INDEX = 3;


var suggest_data = qread(__dirname + '/__test__/avtozapchasti.txt')
.then(function(txt){
  return (''+txt).split('\n');
})
.then(function(lines){  
  return _.map(lines, function(line) {
    var aline =  line.split('###@@@@###');
    aline[kLINE_SENTENCE_INDEX] = aline[kLINE_SENTENCE_INDEX].split(' ');
    return aline;
  });
})
.then(function(lines) {
  return lines;
});


function create_router(app) {
  var router = express.Router();


  router.route('/suggest/:words')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    
    var words = (''+req.params.words).split(' ');
    words = _.filter(words, function(word) {
      return word.length>0;
    });

    if(words.length === 0) {
      res.json([]);
      return;
    } else {


      suggest_data
      .then(function(lines) {
        return lines.filter(function(line){
          var sentence = line[kLINE_SENTENCE_INDEX];
          return _.all(words, function(word) {  
            return _.some(sentence, function(sword) {          
              return sword.startsWith(word);
            });

          });
        });
      })
      .then(function(lines) {
        return _.map(lines, function(line) {
          var sentence = line[kLINE_SENTENCE_INDEX];
          sentence = _.map(sentence, function(sword) {
            if (_.some(words, function(word) {
              return sword.startsWith(word);
            })) {
              return '<strong>' + sword + '</strong>';
            }
            return sword;
          });
          return [line[kLINE_ID], line[kLINE_ARTICUL], line[kLINE_PRODUCER], sentence.join(' ')];
        });
      })
      .then(function(lines) {
        console.log('lines', lines.length);
        res.json(lines);
      })
      .catch(function(e) {
        console.error(e.stack);
        res.status(500).json(e);
      })
      .done();
    }

  });

  return router;
}

module.exports.create_router = create_router;
