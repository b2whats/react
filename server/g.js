'use strict';
var _ = require('underscore');
var express = require('express');
var ice_middlewares = require('ice_middlewares');
var dot = require('dot');
var fs = require('fs');

var uuid = require('node-uuid');

/*eslint-disable */
var config = require(__config + 'config.js');
var router = express.Router();
/*eslint-enable */


var kSCRIPT_COMMONS_URL = null;
var kSCRIPT_URL = null;
var kSTYLE_URL = null;

var index_html_content = null;
var index_template = null;


_.each([
    config.kSERVER_PATH + '/google3d37d823bd681dae.html'
  ],  function(route) {
  router.route(route)
  .all(ice_middlewares.cache_middleware(config.kCACHE_MAIN_PAGE_SECONDS))
  .get(function (req, res) {

        index_html_content = fs.readFileSync(config.kDEV_RELEASE + '/public/google3d37d823bd681dae.html', 'utf8');


      res.send(
        index_html_content

      );


  });
});

module.exports = router;
