'use strict';
/*
хранит poi точки в rtree ввиде координаты + id
var search_at_zoom_n = require('poi_getter.js')(__dirname + '/../../../data/hotels_sorted.txt', {d:'~', id:0, lat:3, lng:4})
*/
var rbush = require('rbush');
var readline = require('readline');
var fs = require('fs');
var q = require('ice_q');
var _ = require('lodash');

//initialize from delimited file with id, lat lng
//example: init (__dirname + '/../../../data/hotels_sorted.txt', {d:'~', id:0, lat:3, lng:4})
function init(poi_data) {
  var tree = rbush(9);
  poi_data = _.filter(poi_data, function(poi) {
    return is_numeric(poi.id) && is_numeric(poi.lat) && is_numeric(poi.lng);
  });

  poi_data = _.map(poi_data, function(poi) {
    return [poi.lat, poi.lng, poi.lat, poi.lng, poi.id];
  });

  tree.load(poi_data);
  return tree;
}


//Math.isNumeric
var is_numeric = function( obj ) { //из jQuery
    return (obj - parseFloat( obj ) + 1) >= 0;
};

//Math.sign
var sign = function(x) {
  return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
};

//poly - convex polygon as [x0,y0, x1,y1 .. xn, yn]
var get_poly_bound = function(poly) {
  var poly_x = _.filter(poly, function(t, index) {return index%2==0;});
  var poly_y = _.filter(poly, function(t, index) {return index%2==1;});
  return [_.min(poly_x), _.min(poly_y), _.max(poly_x), _.max(poly_y)];  
};

//poly - convex polygon as [x0,y0, x1,y1 .. xn, yn]
//pt - [x0,y0]
var pt_in_poly = function(poly, pt) {
  var prev_sign_ = null;

  for(var i=0;i!=poly.length;i+=2) {
    var x0 = poly[i];
    var y0 = poly[i+1];
    var x1 = poly[(i+2)%poly.length];
    var y1 = poly[(i+3)%poly.length];
    var nx = -(y1 - y0);
    var ny =  (x1 - x0);
    var dot_sign = sign(nx*(pt[0] - x0) + ny*(pt[1] - y0));    
    prev_sign_ = prev_sign_ || dot_sign;
    if(prev_sign_!==dot_sign) {
      return false;
    }
    prev_sign_ = dot_sign; 
  }
  return true;
};



//---------------------------------EXPORTS------------------------------------------------------------------------------------

module.exports = function (poi_data_or_promise) {
  return q(poi_data_or_promise)
  .then(function(data) { 
    return init (data);
  })
  .then(function(rtree) {
    return function search(poly, has_rotation) { //poly - convex polygon as [x0,y0, x1,y1 .. xn, yn]
      var bounds = get_poly_bound(poly);
      var items = rtree.search(bounds);
            
      if(has_rotation) { //если карту мало вращают то 4-10 кратный прирост скорости
        items = _.filter(items, function(item) {
          return pt_in_poly(poly, item);
        });
      }
      return items;
    };  
  });
};




//------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------
//-----------------------------TESTS--------------------------------------------------------------------------------------------

if (!module.parent) {

  var data_schema = {
    id: [0,'number'],
    lat:[3,'number'], 
    lng:[4,'number']
  };
  var data_loader = require('./../libs/ice_data_loader.js');
  
  module.exports(data_loader(__dirname + '/../../../../../data/hotels/poi_0.txt', {d:'~', schema:data_schema}))
  .then(function (search){

    var poly = [40.726862595371415, -74.02291679382326, 40.744357385035556, -74.02291679382326, 40.744357385035556, -73.97270584106447, 40.726862595371415, -73.97270584106447];
    //poly = [40.7358991636365, -73.99020189046855, 40.736992574262956, -73.99020189046855, 40.736992574262956, -73.98706370592113, 40.7358991636365, -73.98706370592113];
    //poly = [40.73573732329635, -73.98886688128502, 40.736656927728774, -73.98964752283791, 40.73794327453027, -73.98700818720364, 40.73702368787929, -73.98622754565075];
    //poly = [35.43932513693541, -123.84907396083076, 59.718242331461084, -123.84907396083076, 59.718242331461084, -43.48779760268832, 35.43932513693541, -43.48779760268832];
    console.time('a');
    var items = search(poly, true);//угол поворота можно получать из системы а можно тупо сверяя широту долготу по углам
    console.timeEnd('a');
    console.log(items.length);

    console.time('b');
    var items = search(poly, false);//угол поворота можно получать из системы а можно тупо сверяя широту долготу по углам
    console.timeEnd('b');

    console.log(items.length);
    console.log(items[0]);
  });
}















