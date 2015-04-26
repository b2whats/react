'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var SizeHoc = require('components/hoc/size_hoc.js');

var Link = require('components/link.jsx');
var FixedDataTable = require('fixed-data-table');
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var CatalogPageTableNew = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div style={{backgroundColor: 'red'}} className="catalog-page-table-new">
        jiopppppsss {this.props.width} {this.props.height}
      </div>
    );
  }
});

module.exports = SizeHoc(CatalogPageTableNew);
