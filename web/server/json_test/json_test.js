'use strict';
/*globals __config*/
var config = require(__config+'config.js');

var express = require('express');
var _ = require('underscore');

var ice_middlewares = require('ice_middlewares');


function create_router(app) {
  var router = express.Router();

  router.route('/page/:id')
  .all(ice_middlewares.cache_middleware(0))
  .get( function(req, res) {
    res.json({page:'on server generated text: vasya has id = ' + req.params.id, id:req.params.id, sub_page:{x:'y'}});
  });

  return router;
}

module.exports.create_router = create_router;