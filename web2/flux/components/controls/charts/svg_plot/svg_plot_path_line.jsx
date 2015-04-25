'use strict';
var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var cx = require('classnames');

/* jshint ignore:start */

/* jshint ignore:end */

var SvgPlotPathLine = React.createClass({
  mixins: [PureRenderMixin],
  
  propTypes: {
    value: PropTypes.object,
  },

  render () {
    var class_name = cx('svg-plot-path-line');
    class_name = this.props.hover ? cx('hover', class_name): class_name;
    if(this.props.className) {
      class_name = cx(class_name, this.props.className);
    }

    var d_attribute = this.props.data_2_d(this.props.data, this.props.id);
    return (
        <path 
          className={class_name}
          d={d_attribute}></path>
    );
  }
});

module.exports = SvgPlotPathLine;