'use strict';
/*globals __config*/
var config = require(__config+'config.js');
//var bash_create = require('ice_bash_exec')(config.kHOTELS.data_dir);


//var security = require('ice_security');
//var multiline = require('multiline');
var express = require('express');

//var util = require('util');
var _ = require('underscore');

var ice_middlewares = require('ice_middlewares');

var ip = require('./icon_helpers/icon_parser.js');

var data_loader = require('./algo_poi/libs/ice_data_loader.js');

var get_poi_and_sort = require('./algo_poi/get_poi_and_sort.js');
var data_loader = require('./algo_poi/libs/ice_data_loader.js');

//так как в изначальной своей работе я использую консольные скрипты то и этот сервер это просто затычка для вывода
//везде надо валидить имена словарей иначе можно считать любой файл с сервера

//использую мультилайн чтобы можно было баш команды тупо копировать
//var get_suggestions = bash_create(['VOCAB', 'COUNT'], multiline.stripIndent(function(){/*
//  cat "$VOCAB" | head -n "$COUNT"
//*/})
//);



function create_router(app) {
  var router = express.Router();


  var aspect_2_icon_code = ip(config.kHOTELS.client_dir + config.kHOTELS.font_css);

  var data_promise = data_loader(config.kHOTELS.poi_data.path, {d:'~', schema:config.kHOTELS.poi_data.schema});

  var poi_promise = data_loader(config.kHOTELS.poi.path, {d:'~', schema:config.kHOTELS.poi.schema}); //zoom
  var poi_2_promise = data_loader(config.kHOTELS.poi_2.path, {d:'~', schema:config.kHOTELS.poi_2.schema});//other zoom level

  /*
  var sort_fn_promise = get_poi_and_sort(config.kHOTELS.poi_data.path, config.kHOTELS.poi_data.schema, 
                                         config.kHOTELS.poi.path,      config.kHOTELS.poi.schema);  

  var sort_fn_promise_zoom = get_poi_and_sort(config.kHOTELS.poi_data.path, config.kHOTELS.poi_data.schema, 
                                              config.kHOTELS.poi_2.path,      config.kHOTELS.poi_2.schema);
  */
  var sort_fn_promise = get_poi_and_sort(data_promise, poi_promise);  
  var sort_fn_promise_zoom = get_poi_and_sort(data_promise, poi_2_promise);


  var aspect_loader_promise = data_loader(config.kHOTELS.aspect_dict.path, {d:'~',schema:config.kHOTELS.aspect_dict.schema})
  .then(function(aspects){
    return _.map(aspects, function(aspect) {
      if(aspect.name in aspect_2_icon_code) {
        return _.extend({}, aspect, {icon:'&#x'+aspect_2_icon_code[aspect.name]+';'});
      } 
      return aspect;
    });
  });

  

  router.route('/hotels/poi')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    aspect_loader_promise
    .then(function(aspects){
      res.json({data:aspects});
    })
    .catch(function(e){
      console.error(e);
      res.send(500, JSON.stringify(e.toString()));
    }).done();
  })
  .post( function(req, res) {

    console.log(req.body.zoom, req.body.zoom < 6);
    var fn_promise = (req.body.zoom < 6) ? sort_fn_promise_zoom : sort_fn_promise;

    //console.log(req.body);
    fn_promise
    .fcall(req.body.poly, req.body.aspect_indexes, req.body.has_rot, req.body.top_k)
    .then(function(poi_req){      
      res.json({data:poi_req});
    })
    .catch(function(e){
      console.error(e);
      res.send(500, JSON.stringify(e.toString()));
    }).done();




  });


  //example http://www.map-local.ru/hotels_info/hotels/ny_hotels.txt/10
  /*
  router.route('/hotels/:VOCAB/:COUNT')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    
      req.checkParams('COUNT', 'Invalid count').notEmpty().isInt();

      var errors = req.validationErrors();
      if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return;
      }

      get_suggestions(req.params.VOCAB, req.params.COUNT)
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
  */


  return router;
}

module.exports.create_router = create_router;

