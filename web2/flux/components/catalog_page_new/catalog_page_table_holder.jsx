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
        //key="table"
        //width={Math.floor(this.props.width)}
        //height={Math.floor(this.props.height)}
        //rowHeight={112}
        //rowHeightGetter={this.getRowHeight}
        //rowGetter={getObjectAt}
        //rowClassNameGetter={getRowClassName}
        //scrollToRow={this.state.startRow}
        //onScroll={this._onTableScroll}
        //onReactWheelHandlerChanged={this._onReactWheelHandlerChanged}
        //rowsCount={1000}
        //overflowX={'auto'}
        //overflowY={'auto'}
        {...this.props}
        >
        <Column
          dataKey="num"
          fixed={true}
          label=""
          width={50} />

        <Column
          dataKey="name"
          flexGrow={1}
          label="name"
          width={50} />
      
        <Column
          dataKey="description"
          
          label="description"
          flexGrow={1}
          width={50} />
      </Table>
    );
  }
});

module.exports = CatalogPageTableHolder;
