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
    num: i,
    name: `name ${i}`,
    description: `description ${i}`,
  };
};

var getHeightAt = (i) => {
  return 30 + (i%2)*20;
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
            key="b"
            width={Math.floor(this.props.width)}
            height={Math.floor(this.props.height)}
            rowHeight={40}
            //headerHeight={50}
            rowGetter={getObjectAt}
            rowHeightGetter={getHeightAt}
            rowsCount={100}
            overflowX={'auto'}
            overflowY={'auto'}
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
            :
          null
        }
      </div>
    );
  }
});

module.exports = SizeHoc(CatalogPageTableNew);
