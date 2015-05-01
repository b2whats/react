'use strict';

var _ = require('underscore');
//-------------------------------------------------------------------------------------------
//Код этих либ выдран из mapboxgl чтобы преобразования координат не зависели от библиотеки
var LatLng = require('./lib_geo/lat_lng.js');
var Point = require('point-geometry');
var Transform = require('./lib_geo/transform.js');
//-------------------------------------------------------------------------------------------

function Geo(tile_size, view_from_left_top) { //left_top view пользует гугл
  if(!tile_size) tile_size = 512;
  this.has_size = false;
  this.has_view = false;
  this.transform = new Transform(tile_size);
  this.view_from_left_top = !!view_from_left_top;
}

Geo.prototype.set_view = function(center, zoom, bearing) {
  this.transform.center = LatLng.convert(center);
  this.transform.zoom = +zoom;
  this.transform.bearing = +bearing;
  this.has_view = true;
};

Geo.prototype.set_view_size = function(width, height) {
  this.transform.width = width;
  this.transform.height = height;
  this.has_size = true;
};

Geo.prototype.can_project = function() {
  return this.has_size && this.has_view;
};

Geo.prototype.unproject = function(pt_x_y) {
  if(this.view_from_left_top) {
    var ptxy = _.extend({}, pt_x_y);
    ptxy.x += this.transform.width/2;
    ptxy.y += this.transform.height/2;
    return this.transform.pointLocation(Point.convert(ptxy));
  } else {
    return this.transform.pointLocation(Point.convert(pt_x_y));
  }
};

Geo.prototype.project = function(pt_lat_lng) {
  if(this.view_from_left_top) {
    var pt = this.transform.locationPoint(LatLng.convert(pt_lat_lng));
    pt.x -= this.transform.width/2;
    pt.y -= this.transform.height/2;
    return pt;    
  } else {
    return this.transform.locationPoint(LatLng.convert(pt_lat_lng));
  }
};

Geo.prototype.get_width = function() {
  return this.transform.width;
};

Geo.prototype.get_height = function() {
  return this.transform.height;
};

Geo.prototype.get_zoom = function() {
  return this.transform.zoom;
};

Geo.prototype.unproject_bounds_with_margin = function(bounds, round_factor) {
  var bnd_t = bounds[0];
  var bnd_r = bounds[1];
  var bnd_b = bounds[2];
  var bnd_l = bounds[3];
  
  if(this.transform.width - bnd_r - bnd_l > 0 && this.transform.height - bnd_t - bnd_b > 0) {
    var top_left_corner =     this.unproject({x: bnd_l,                        y: bnd_t});
    var top_right_corner =    this.unproject({x: this.transform.width - bnd_r, y: bnd_t});
    var bottom_right_corner = this.unproject({x: this.transform.width - bnd_r, y: this.transform.height - bnd_b});
    var bottom_left_corner =  this.unproject({x: bnd_l,                        y: this.transform.height - bnd_b});
    
    var res =  [
      top_right_corner.lat, top_right_corner.lng,
      bottom_right_corner.lat, bottom_right_corner.lng,
      bottom_left_corner.lat, bottom_left_corner.lng,
      top_left_corner.lat, top_left_corner.lng,
    ];

    if(round_factor) {
      res = _.map(res, r => Math.round(r*round_factor)/round_factor);
    }
    return res;
  } else {
    return [0,0, 0,0, 0,0, 0,0];
  }
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