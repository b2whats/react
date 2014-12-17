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
var feature_list = require('./__test__/feature_list.json');

function create_router(app) {
  var router = express.Router();

  router.route('/:sphere_id/features')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    res.json(feature_list); //call to API
  });

  router.route('/:sphere_id/filters')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    
    res.json([
      {id:"bool_filter", title: 'filter Boolean', type: 'bool'},
      {id:"in_filter", title: 'filter Country', type: 'in', values:[
        {id:'-usa-', title:'USA'},
        {id:'-rus-', title:'Russia'},
        {id:'-france-', title:'France'},

        {id:'-ger-', title:'Germany'},
        {id:'-bel-', title:'Belgium'},
        {id:'-mex-', title:'Mexico'}

      ]},
      {id:"in_filter_2", title: 'filter Price', type: 'in', values:[
        {id:'-2small-', title:'small'},
        {id:'-2big-', title:'big'},
        {id:'-2verybig-', title:'average'}
      ]}
    ]);


  });

  router.route('/:sphere_id/bins')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    qread(__dirname + '/__test__/'+req.params.sphere_id+'.json')
    .then(function(data) {
      res.json(JSON.parse(data));
    })
    .catch(function(e) {
      res.status(500).json({error:e});
    })
    .done();
  })
  .post( function(req, res) {
    qwrite(__dirname + '/__test__/'+req.params.sphere_id+'.json', JSON.stringify(req.body, null, ' '))
    .then(function() {
      res.json({ok:'ok'});
    })
    .catch(function(e) {
      res.status(500).json({error:e});
    })
    .done();

  });


  return router;
}

module.exports.create_router = create_router;


