'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var PriceListSelector = require('components/test/price_list_selector.jsx');

var Test2 = React.createClass({

  mixins: [PureRenderMixin],

  render() {
    return (
      <div>
        <h1 className="noselect">test</h1>
        <PriceListSelector />
      </div>
    );
  }
});

module.exports = Test2;
