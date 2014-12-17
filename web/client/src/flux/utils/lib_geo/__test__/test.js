'use strict';

var LatLng = require('../lat_lng.js');
var Point = require('point-geometry');
var Tranform = require('../transform.js');
var transform = new Tranform();

var init_center = {lat:40.72, lng:-74.0000};


var center = [init_center.lat, init_center.lng];
var zoom = 12;
var bearing = 0;

transform.center = LatLng.convert(center);
transform.zoom = +zoom;
transform.bearing = +bearing;


transform.width = 1100;
transform.height = 700;
//transform._constrain();

var marker = {lat: 40.72, lng: -74.00};

console.log( transform.locationPoint(LatLng.convert(marker)) );
console.log( transform.pointLocation(Point.convert({x:550, y:350})) );
