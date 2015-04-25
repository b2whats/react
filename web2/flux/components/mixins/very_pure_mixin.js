'use strict';
/*
не проверяет children свойство
*/

function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  
  // Test for A's keys different from B.

  for (key in objA) {
    if(key!=='children') {
      if (objA.hasOwnProperty(key) &&
          (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
        return false;
      }
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if(key!=='children') {
      if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
        return false;
      }
    }
  }
  return true;
}

var VeryPureRenderMixin = {
  shouldComponentUpdate: function(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
           !shallowEqual(this.state, nextState);
  }
};

module.exports = VeryPureRenderMixin;
