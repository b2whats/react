'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var {Table, Column} = require('fixed-data-table-ice');
require('fixed-data-table-ice/dist/fixed-data-table.css');
/* jshint ignore:end */


var CatalogPageTableHolder = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    return (
      <Table
        {...this.props}
        >
        {this.props.columns.map((c, index) => (<Column key={index} {...c} />))}
      </Table>
    );
  }
});

module.exports = CatalogPageTableHolder;
