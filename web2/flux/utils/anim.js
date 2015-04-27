'use strict';
var raf = require('utils/raf.js');
var easing = require('utils/easing');

var anim = function(delta_t, from, to, ease_name, callback) {
  var dt_start = (new Date()).getTime();
  var easing_fn = easing[ease_name];

  var can_run = true;

  var runner = function() {
    var t = Math.min(((new Date()).getTime() - dt_start)/delta_t, 1);
    
    var x = easing_fn(t, from, to);
    if(can_run && callback(x, t)) {
      if(t<1) {
        raf(runner);
      }
    } 
  };

  raf(runner);

  return function() {
    can_run = false;
  }
};

module.exports = anim;
