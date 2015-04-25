'use strict';

var _ = require('underscore');

var kINFLEXION = 0.35;
var kSTART_TENSION = 0.5;
var kEND_TENSION = 1.0;
var kP_ALPHA = kSTART_TENSION * kINFLEXION;
var kP_BETA = 1.0 - kEND_TENSION * (1.0 - kINFLEXION);

var kNUM_SAMPLES = 100;

var kEPSILON = 1e-5;

function approx_equals(a, b) {
  return Math.abs(a - b) < kEPSILON;
}

var kSPLINE_POSITION_ = [];
var kSPLINE_TIME_ = [];

//походу что-то отруки рисованное приблизили походу хермитом или чем то подобным взято отсюда 
//https://code.google.com/p/chromium/codesearch#chromium/src/ui/events/android/scroller.cc&sq=package:chromium&dr=CSs
//немного похоже на cx = (1 - cx) * 0.14 + cx; но побыстрее сходится
(function init() {
  var x_min = 0.0;
  var y_min = 0.0;
    
  for (var i = 0; i < kNUM_SAMPLES; ++i) {
    var alpha = i / kNUM_SAMPLES;

    var x_max = 1.0;
    var x, tx, coef;

    while (true) {
      x = x_min + (x_max - x_min) / 2.0;
      coef = 3.0 * x * (1.0 - x);
      tx = coef * ((1.0 - x) * kP_ALPHA + x * kP_BETA) + x * x * x;
      if (approx_equals(tx, alpha))
        break;
      if (tx > alpha)
        x_max = x;
      else
        x_min = x;
    }
    kSPLINE_POSITION_[i] = coef * ((1.0 - x) * kSTART_TENSION + x) + x * x * x;

    var y_max = 1.0;
    var y, dy;
    while (true) {
      y = y_min + (y_max - y_min) / 2.0;
      coef = 3.0 * y * (1.0 - y);
      dy = coef * ((1.0 - y) * kSTART_TENSION + y) + y * y * y;
      if (approx_equals(dy, alpha))
        break;
      if (dy > alpha)
        y_max = y;
      else
        y_min = y;
    }
    kSPLINE_TIME_[i] = coef * ((1.0 - y) * kP_ALPHA + y * kP_BETA) + y * y * y;
  }
  kSPLINE_POSITION_[kNUM_SAMPLES] = kSPLINE_TIME_[kNUM_SAMPLES] = 1.0;
}) ();



function calculate_coefficients(t) {
  var distance_coef = 1.0;
  var velocity_coef = 0.0;

  var index = Math.floor(kNUM_SAMPLES * t); //всегда положительное поэтому можно floor

  if (index < kNUM_SAMPLES) {
    var t_inf = index / kNUM_SAMPLES;
    var t_sup = (index + 1) / kNUM_SAMPLES;
    var d_inf = kSPLINE_POSITION_[index];
    var d_sup = kSPLINE_POSITION_[index + 1];
    velocity_coef = (d_sup - d_inf) / (t_sup - t_inf);
    distance_coef = d_inf + (t - t_inf) * velocity_coef;
  }
  return {vc: velocity_coef, dc: distance_coef};
}


module.exports = calculate_coefficients;
