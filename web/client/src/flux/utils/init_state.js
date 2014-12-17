'use strict';

var _ = require('underscore');
var atom = require('./../stores/atom.js');
var immutable = require('immutable');

function init_state(module_name, state_defs) {
  var state = {};

  _.each(state_defs, function(value, key) {
    Object.defineProperty(state, key+'_cursor', {
      get: function() {
        return atom.get_cursor([module_name, key]);
      }
    });
    
    Object.defineProperty(state, key, {
      get: function() {
        return atom.get_in([module_name, key]);
      }
    });  
  });
  
  atom.get_cursor(module_name)
  .update(function(v){
    if(v) return v;
    return immutable.fromJS(state_defs);
  });
  return state;
}


module.exports = init_state;

