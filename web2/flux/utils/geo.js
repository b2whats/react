'use strict';

//-------------------------------------------------------------------------------------------
//Код этих либ выдран из mapboxgl чтобы преобразования координат не зависели от библиотеки
var LatLng = require('./lib_geo/lat_lng.js');
var Point = require('point-geometry');
var Transform = require('./lib_geo/transform.js');
//-------------------------------------------------------------------------------------------

function Geo() {
  this.transform = new Transform();
}

Geo.prototype.set_view = function(center, zoom, bearing) {
  this.transform.center = LatLng.convert(center);
  this.transform.zoom = +zoom;
  this.transform.bearing = +bearing;
};

Geo.prototype.set_view_size = function(width, height) {
  this.transform.width = width;
  this.transform.height = height;
};

Geo.prototype.unproject = function(pt_x_y) {
  return this.transform.pointLocation(Point.convert(pt_x_y));
};

Geo.prototype.project = function(pt_lat_lng) {
  return this.transform.locationPoint(LatLng.convert(pt_lat_lng));
};

module.exports = Geo;

/* //тест
var marker = {lat: 40.72, lng: -74.00};
var init_center = {lat:40.72, lng:-74.0000};
var center = [init_center.lat, init_center.lng];
var zoom = 12;
var bearing = 0;
var g = new Geo();
g.set_view(center, zoom, bearing);
g.set_view_size(1100, 700);

console.log( g.world_2_view (marker) );
console.log( g.view_2_world({x:550, y:350}) );
*/