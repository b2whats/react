'use strict';

var integrating_velocity_tracker = require('./integrating_velocity_tracker.js');

var kASSUME_POINTER_MOVE_STOPPED_TIME_S = 0.3;

var kASSUME_POINTER_UP_STOPPED_TIME_S = 0.4;

module.exports = function() {

  var estimator_ = {
    kMaxDegree: 4,  
    time: 0,// Estimator time base.

    // Polynomial coefficients describing motion in X and Y.
    xcoeff:[0,0,0,0,0], //kMaxDegree + 1
    ycoeff:[0,0,0,0,0], //kMaxDegree + 1

    // Polynomial degree (number of coefficients), or zero if no information is
    // available.
    degree: 0,
    confidence: 0,

    clear() {
      this.time = window.performance.now()/1000;
      this.degree = 0;
      this.confidence = 0;
      for (var i = 0; i <= this.kMaxDegree; i++) {
        this.xcoeff[i] = 0;
        this.ycoeff[i] = 0;
      }
    }
  };



  var strategy_ = integrating_velocity_tracker();
  var last_event_time_ = 0;

  function clear() {
    strategy_.clear();
  }


  function add_movement(event_time, positions) {

    if ((event_time - last_event_time_) >= kASSUME_POINTER_MOVE_STOPPED_TIME_S) {    
      strategy_.clear(); // We have not received any movements for too long. Assume that all pointers have stopped.
    }

    last_event_time_ = event_time;

    strategy_.add_movement(event_time, positions);
  }


  return {
    add_movement_event(event) {
      switch (event.type) {
        case 'touchstart':
          clear();
          break;
        
        case 'touchend':
          if ((event.timeStamp/1000 - last_event_time_) >= kASSUME_POINTER_UP_STOPPED_TIME_S) {
            strategy_.clear();
          }
          return;
      }
      var position = {x:event.touches[0].clientX, y:event.touches[0].clientY};
      add_movement(event.timeStamp/1000, position);
    },

    get_velocity() {
      if (strategy_.get_estimator(estimator_) && estimator_.degree >= 1) {
        return {
          vx: estimator_.xcoeff[1],
          vy: estimator_.ycoeff[1]
        };
      }

      return {vx:0, vy:0};
    },

    get_position() {

      if (strategy_.get_estimator(estimator_)) {
        return {
          x: estimator_.xcoeff[0],
          y: estimator_.ycoeff[0]
        };
      } else {
        return {x:NaN, y:NaN};
      }

    }

  };

};


