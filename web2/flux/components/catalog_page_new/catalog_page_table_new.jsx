'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var SizeHoc = require('components/hoc/size_hoc.js');

var Link = require('components/link.jsx');
var {Table, Column} = require('fixed-data-table');
require('fixed-data-table/dist/fixed-data-table.css');

var getObjectAt = (i) => {

  return {
    name: `name ${i}`,
    description: `description ${i}`,
  };
};

var renderImage = (cell_data) => (
  <div>cell_data</div>
);

var CatalogPageTableNew = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    
    return (
      <div style={{backgroundColor: 'red'}} className="catalog-page-table-new">        
        {this.props.width && this.props.height ? 
          <Table
            width={this.props.width}
            height={this.props.height}
            rowHeight={40}
            headerHeight={50}
            rowGetter={getObjectAt}
            rowsCount={100}
            >

          <Column
            dataKey="name"
            flexGrow={1}
            label="xxx"
            width={50} />
        
          <Column
            dataKey="description"
            
            label="xxx"
            flexGrow={1}
            width={50} />

          </Table>
            :
          null
        }
      </div>
    );
  }
});

module.exports = SizeHoc(CatalogPageTableNew);
