'use strict';

var _ = require('lodash');

var poi_rtree = require('./libs/poi_rtree.js');
var top_k = require('./libs/top_k.js');
//var data_loader = require('./libs/ice_data_loader.js');
var rank_fn = require('./rank_function.js');
var q = require('ice_q');


module.exports = function(data_promise, poi_promise) { //function(data_path, data_schema, poi_path, poi_schema) {
  return q.all([
    //poi_rtree(data_loader(poi_path, {d:'~',schema:poi_schema})),
    poi_rtree(poi_promise),
    
    //top_k(data_loader(data_path, {d:'~',schema:data_schema}))
    top_k(data_promise)
    .then(function(top_k_fn) {
      return function(data_indexes, aspect_indexes, k) {
        return top_k_fn(data_indexes, rank_fn(aspect_indexes), k); //rank_fn(aspect_indexes) = ( f(data) -> rank )
      };
    })
  ])
  .spread(function(poi_search, top_k_by_aspect_rank) {
    var kINDEX = 4;
    return function(poly, aspect_indexes, has_rotation, k) {
      console.time('time_select');
      var items = poi_search(poly, has_rotation);
      
      var data_indexes = _.map(items, function(item){return item[kINDEX];});
      var res = top_k_by_aspect_rank(data_indexes, aspect_indexes, k);
      console.timeEnd('time_select');
      console.log('get_poi_and_sort items.length',items.length); 
      return res;
    };
  });
};







//---------------------TEST-----------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------

if (!module.parent) { (function(){

  var data_schema = {
    index:[0, 'number'],
    rid:[1,'number'],
    name:[2,'string'], 
    country:[3,'string'],
    lat:[4,'number'], 
    lng:[5,'number'],
    review_length: [6, 'number'], 
    aspect_data: [7, 'json']

  };

  var poi_schema = {
    id: [0,'number'],
    lat:[3,'number'], 
    lng:[4,'number']
  };

  var data_path = __dirname + '/../../../../data/hotels/poi_data.txt';
  var poi_path  = __dirname + '/../../../../data/hotels/poi_0.txt';

  var fn_promise = module.exports(data_path, data_schema, poi_path, poi_schema);


  var poly = [
  40.726862595371415, -74.02291679382326,
  40.744357385035556, -74.02291679382326, 
  40.744357385035556, -73.97270584106447, 
  40.726862595371415, -73.97270584106447];

  poly = [37.66608106038571, -81.27438458942538, 41.87860528084221, -81.27438458942538, 41.87860528084221, -69.71398829343049, 37.66608106038571, -69.71398829343049];

  poly = [40.686229631781146,-74.10042190551758,40.753753244335115,-74.10042190551758,40.753753244335115,-73.89957809448242,40.686229631781146,-73.89957809448242];

  //poly = [35.43932513693541, -123.84907396083076, 59.718242331461084, -123.84907396083076, 59.718242331461084, -43.48779760268832, 35.43932513693541, -43.48779760268832];    
  var aspect_indexes = [5,20,70, 100];
  aspect_indexes = [1,3,5];

  fn_promise.fcall(poly, aspect_indexes, true, 10)
  .then(function(poi_req){
    console.log(poi_req[0]);
  })
  .catch(function(e){
    console.error(e);
  }).done();

  setTimeout(function(){
    console.time('tmt');
    fn_promise.fcall(poly, aspect_indexes, true, 50)
    .then(function(poi_req){
      //console.log(poi_req[0]);
      console.timeEnd('tmt');
    })
    .catch(function(e){
      console.error(e);
    }).done();

  }, 25000);

  setTimeout(function(){
    console.time('tmt');
    fn_promise.fcall(poly, aspect_indexes, false, 50)
    .then(function(poi_req){
      //console.log(poi_req[0]);
      console.timeEnd('tmt');
    })
    .catch(function(e){
      console.error(e);
    }).done();

  }, 27000);

})();}

