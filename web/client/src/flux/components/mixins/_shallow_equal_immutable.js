'use strict';

var immutable = require('immutable');

function shallow_equal_immutable(obj_a, obj_b) {
  if (immutable.is(obj_a, obj_b)) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in obj_a) {
    if (obj_a.hasOwnProperty(key) &&
        (!obj_b.hasOwnProperty(key) || !immutable.is(obj_a[key], obj_b[key]))) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in obj_b) {
    if (obj_b.hasOwnProperty(key) && !obj_a.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallow_equal_immutable;
