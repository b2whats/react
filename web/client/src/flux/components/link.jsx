'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var page = require('page'); //router

var Link = React.createClass({
  mixins: [PureRenderMixin],

  on_click (event) {
    page(this.props.href);
    event.preventDefault();
    event.stopPropagation();
  },

  render () {

    /* jshint ignore:start */
    return (
      <a onClick={this.on_click} {...this.props}>{this.props.children}</a>
    )
    /* jshint ignore:end */
  }
});

module.exports = Link;
