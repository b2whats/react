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
    config.kSERVER_PATH + '/',
    config.kSERVER_PATH + '/:x',
    config.kSERVER_PATH + '/:x/:y',
    config.kSERVER_PATH + '/*',
  ],  function(route) {
  router.route(route)
  .all(ice_middlewares.cache_middleware(config.kCACHE_MAIN_PAGE_SECONDS))
  .get(function (req, res) {
    
    try {

      if(!config.kIS_PRODUCTION || kSCRIPT_URL === null) {
        var stats = require('../build/stats.json');
        var publicPath = stats.publicPath;
        var urls = [].concat(stats.assetsByChunkName.main);

        kSTYLE_URL = urls.length > 1 ? publicPath + urls[1] : null;//"main.css?" + stats.hash;
        kSCRIPT_URL = publicPath + urls[0];
        kSCRIPT_COMMONS_URL = stats.assetsByChunkName.commons ? publicPath + stats.assetsByChunkName.commons : null;
        
        index_html_content = fs.readFileSync(config.kDEV_RELEASE + '/public/index.html', 'utf8');
        index_template = dot.template(index_html_content);
      }    

      var fb_title = 'facebook title';
      var twitter_title = fb_title;
      var description = 'some description';

      var image = (req.query.fb && req.query.fb.length > 2) ? 
        'http://' + req.headers.host +  config.kSERVER_PATH + '/assets/images/logo_for_social.jpg' : 
        'http://' + req.headers.host +  config.kSERVER_PATH + '/assets/images/logo_for_social.jpg';

      
      res.send(
        index_template({
          config: {
            'kSERVER_PATH': config.kSERVER_PATH,
            'kSCRIPT_URL': kSCRIPT_URL,
            'kSTYLE_URL': kSTYLE_URL,
            'kSCRIPT_COMMONS_URL': kSCRIPT_COMMONS_URL,
            'kSESSION_UUID' : uuid.v4(),
          },        

          FB: {
            image: image, //'http://' + req.headers.host +  '/assets/images/private-beach.jpg', 
            title: fb_title,
            description: description
          },

          twitter: {
            image: image, //'http://' + req.headers.host +  '/assets/images/private-beach.jpg', 
            title: twitter_title,
            description: description
          }
        })
      );
    } catch (e) {
      res.status(500).send('чуть погоди, please wait build to complete, ' + e.toString());
    }

  });
});

module.exports = router;
