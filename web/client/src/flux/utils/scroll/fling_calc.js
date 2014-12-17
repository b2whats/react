'use strict';
// Default scroll duration from android.widget.Scroller.
var kDefaultDurationMs = 250;

// Default friction constant in android.view.ViewConfiguration.
var kDEFAULT_FRICTION = 0.015;

// == std::log(0.78f) / std::log(0.9f)
var kDECELERATION_RATE = 2.3582018;

// Tension lines cross at (kINFLECTION, 1).
var kINFLECTION = 0.35;

var kEpsilon = 1e-5;

// Fling scroll is stopped when the scroll position is |kThresholdForFlingEnd|
// pixels or closer from the end.
var kThresholdForFlingEnd = 0.1;

var fling_friction_ = kDEFAULT_FRICTION;
var tuning_coeff_ = compute_deceleration(0.84);


function compute_deceleration(friction) {
  var kGravityEarth = 9.80665;
  return kGravityEarth * 39.37 * 160 * friction;
}


function get_spline_deceleration(velocity) {
  return Math.log(kINFLECTION * Math.abs(velocity) /
                  (fling_friction_ * tuning_coeff_));
}

function get_spline_fling_duration(velocity) {
  var l = get_spline_deceleration(velocity);
  var decel_minus_one = kDECELERATION_RATE - 1.0;
  var time_seconds = Math.exp(l / decel_minus_one);
  return time_seconds;
}

function solve_velocity(b, e, value) {


}


function get_spline_fling_distance(velocity){
  var l = get_spline_deceleration(velocity);
  var decel_minus_one = kDECELERATION_RATE - 1.0;
  return fling_friction_ * tuning_coeff_ *
         Math.exp(kDECELERATION_RATE / decel_minus_one * l);
}

//осталось научиться предсказывать начальную velocity


//console.log(get_spline_fling_duration(1.18*1000));
//console.log(get_spline_fling_duration(1.43*1000));
module.exports.get_spline_fling_duration = function(v) {
  return get_spline_fling_duration(v);
};

module.exports.get_spline_fling_distance = function(v) {
  return get_spline_fling_distance(v);
};





