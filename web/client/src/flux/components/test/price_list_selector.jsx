'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;


var PriceListSelector = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
  },


  render () {
    return (
    <div className={this.props.className}>
    nen
    </div>
    );
  }
});

module.exports = PriceListSelector;

