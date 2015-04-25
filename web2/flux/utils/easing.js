'use strict';

module.exports.ease_in_sine =  function (t, from, to) {
  var d = 1;
  var c = to - from;

  return -c * Math.cos(t/d * (Math.PI/2)) + c + from;
};


module.exports.ease_in_cubic = function (t, from, to) {
  var d = 1;
  var c = to - from;

  return c*(t/=d)*t*t + from;
};

