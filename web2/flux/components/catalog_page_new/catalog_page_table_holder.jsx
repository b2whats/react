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
    var {cellRenderer, ...other} = this.props;
    return (
      <Table
        {...other}
        >
        {this.props.columns.map((c, index) => (<Column key={index} cellRenderer={cellRenderer} {...c} />))}
      </Table>
    );
  }
});

module.exports = CatalogPageTableHolder;
