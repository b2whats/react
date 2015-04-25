'use strict';
// --- IntegratingVelocityTrackerStrategy ---


module.exports = function() {

  var degree_ = 1;
  var pointer_state_ = {};

  function init_state(state, event_time, xpos, ypos) {
    state.update_time = event_time;
    state.degree = 0;
    state.xpos = xpos;
    state.xvel = 0;
    state.xaccel = 0;
    state.ypos = ypos;
    state.yvel = 0;
    state.yaccel = 0;
    state.need_init_state = false;
  }
  init_state(pointer_state_, 0, 0, 0);

  function update_state(state, event_time, xpos, ypos) {

    var kMIN_TIME_DELTA = 2*1/1000000;  
    var kFILTER_TIME_CONSTANT = 0.010;  // 10 milliseconds

    //if (event_time <= state.update_time + kMIN_TIME_DELTA)
    //  return;
    var dt = event_time - state.update_time;  
    state.update_time = event_time;
    var xvel = (xpos - state.xpos) / dt;
    var yvel = (ypos - state.ypos) / dt;
    if (state.degree === 0) {
      state.xvel = xvel;
      state.yvel = yvel;
      state.degree = 1;
    } else {
      var alpha = dt / (kFILTER_TIME_CONSTANT + dt);
      if (degree_ === 1) {
        state.xvel += (xvel - state.xvel) * alpha;
        state.yvel += (yvel - state.yvel) * alpha;
      }
    }
    state.xpos = xpos;
    state.ypos = ypos;
  }

  function populate_estimator(state, out_estimator) {
    out_estimator.time = state.update_time;
    out_estimator.confidence = 1.0;
    out_estimator.degree = state.degree;
    out_estimator.xcoeff[0] = state.xpos;
    out_estimator.xcoeff[1] = state.xvel;
    out_estimator.xcoeff[2] = state.xaccel / 2;
    out_estimator.ycoeff[0] = state.ypos;
    out_estimator.ycoeff[1] = state.yvel;
    out_estimator.ycoeff[2] = state.yaccel / 2;
  }

  return {
    clear_pointers() {
      pointer_state_.need_init_state = true;
    },
    clear () {
      this.clear_pointers();
    },


    add_movement(event_time, positions) {
      var state = pointer_state_;
      var position = positions;

      if (!state.need_init_state) {
        update_state(state, event_time, position.x, position.y);
      }
      else {
        init_state(state, event_time, position.x, position.y);
      }
    },

    get_estimator(out_estimator) {
      out_estimator.clear();

      if(!pointer_state_.need_init_state) {
        populate_estimator(pointer_state_, out_estimator);
        return true;
      }
      return false;
    }
  };
};


