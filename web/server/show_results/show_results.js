'use strict';

var config = require(__config+'config.js');
var bash_create = require('ice_bash_exec')(config.kFIND_TRANSLATION.data_dir);

var security = require('ice_security');
var multiline = require('multiline');
var express = require('express');

var util = require('util');
var _ = require('underscore');
var ice_middlewares = require('ice_middlewares');


//использую мультилайн чтобы можно было баш команды тупо копировать
var get_lines = bash_create(['VOCAB', 'LINE_FROM', 'LINE_TO'], multiline.stripIndent(function() {/*
  cat "$VOCAB".txt | sed -n "${LINE_FROM},${LINE_TO}p"
*/})
);


function create_router(app) {
  var router = express.Router();

  //example http://www.turk-local.ru/find_translation_service/vocab/vocab_nouns.txt/10
  router.get('/show_results/:VOCAB/:PAGE', security.has_role_middleware(config.kFIND_TRANSLATION.access),
    function(req, res){
      //TODO валидация
      //req.params.vocab должен быть стринг только из букв цифр и точек
      //не должен начинацо ни на / ни на ~ не должен иметь двоеточий
      //надо другой валидатор этот ГОВНО не работает матч по regexp
      req.checkParams('PAGE', 'Invalid page number').notEmpty().isInt();

      console.error('hi');

      var errors = req.validationErrors();
      if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return;
      }

      req.params.VOCAB = req.params.VOCAB.replace(/\+/ig, '/')

      var kPAGE_SIZE = 100;
      var line_from = req.params.PAGE*kPAGE_SIZE + 1;
      var line_to = (req.params.PAGE*1+1)*kPAGE_SIZE;
      console.error(req.params.VOCAB, line_from, line_to);

      get_lines(req.params.VOCAB, line_from, line_to)
      .then(function(stdout){
        var out = stdout.split(/\n/ig);
        out.pop();
        res.json(out);
      })
      .catch(function(e) {
        console.error('ICE::-----------------------------------------');
        res.send(500, JSON.stringify(e.toString()));
      }).done();
    });
return router;
}

module.exports.create_router = create_router;