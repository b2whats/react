'use strict';

var shallow_equal_immutable = require('./shallow_equal_immutable');

var immutable_render_mixin = {
  shouldComponentUpdate: function(nextProps, nextState) {    
    return !shallow_equal_immutable(this.props, nextProps) ||
           !shallow_equal_immutable(this.state, nextState);
  }
};

module.exports = immutable_render_mixin;
