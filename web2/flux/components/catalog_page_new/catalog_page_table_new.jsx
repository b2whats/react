'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var SizeHoc = require('components/hoc/size_hoc.js');

var Link = require('components/link.jsx');
var {Table, Column} = require('fixed-data-table-ice');
require('fixed-data-table-ice/dist/fixed-data-table.css');

var ReactWheelHandler = require('fixed-data-table-ice/internal/ReactWheelHandler');

var getObjectAt = (i) => {
  if(i === 0) return null;
  return {
    num: i,
    name: `name ${i}`,
    description: `description ${i}`,
  };
};

var getRowClassName = (i) => {  
  return i===0 ? '--first-row' : '';
};

var renderImage = (cell_data) => (
  <div>cell_data</div>
);
//public_fixedDataTableCell_main

var kROW_HEIGHT = 112;
var kSCROLL_HEADER_DEBOUNCE = 20;
var kSCROLL_HEADER_DEBOUNCE_EPS = 2;

var CatalogPageTableNew = React.createClass({
  mixins: [PureRenderMixin],
  
  getInitialState() {
    return {
      headerTop: 0,
      wheelHandler: null,
      showMainHeader: true
    };
  },

  getRowHeight(index) {
    return index===0 ? this.props.headerHeight : kROW_HEIGHT;
  },

  //---------------Логика для хедера чтобы уплывал и чтобы на нем скрол работал ---------------------
  //для передавать события onWheel с хедера напрямую в табличку
  _onReactWheelHandlerChanged(wheelHandler) {
    if(this.isMounted) {
      this.setState({wheelHandler});
    }
  },

  _onTableScroll(x, y) {
    var kMINI_HEADER_HEIGHT = 40;
    if(this.isMounted) {
      var header_top = Math.min(y, this.props.headerHeight + kSCROLL_HEADER_DEBOUNCE);

      if(y < this.props.headerHeight + kSCROLL_HEADER_DEBOUNCE || header_top !== -this.state.headerTop) {
        //не обновлять state когда хедер уже скрыт
        this.setState({headerTop:-header_top});
      }
    
      var show_main_header = this.state.showMainHeader; 
      if(this.state.showMainHeader === true) {
        if (-header_top < -(this.props.headerHeight - kMINI_HEADER_HEIGHT + kSCROLL_HEADER_DEBOUNCE_EPS)) {
          show_main_header = false;
        }
      } else {

        if (-header_top > -(this.props.headerHeight - kMINI_HEADER_HEIGHT -  kSCROLL_HEADER_DEBOUNCE_EPS)) {
          show_main_header = true;
        }
      }
      if(show_main_header !== this.state.showMainHeader) {
        this.setState({showMainHeader: show_main_header});
      }
    }
  },
  //---------------------------------------------------------------------------------------------------
  componentWillReceiveProps(nextProps) {
    if(nextProps.startRow!==null && this.props.startRow===null) {
      this._onTableScroll(0,0);
    }
  },

  render () {    
    return (      
      <div style={{backgroundColor: 'red'}} className="catalog-page-table-new">
        {this.props.width && this.props.height ?
          [
            <Table
              key="table"
              width={Math.floor(this.props.width)}
              height={Math.floor(this.props.height)}
              rowHeight={112}
              rowHeightGetter={this.getRowHeight}
              rowGetter={getObjectAt}
              //rowClassNameGetter={getRowClassName}
              scrollToRow={this.props.startRow}
              onScroll={this._onTableScroll}
              onReactWheelHandlerChanged={this._onReactWheelHandlerChanged}
              rowsCount={1000}
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
            ,
            this.state.showMainHeader ? 
              <div 
                key="table-header" 
                onWheel={this.state.wheelHandler && this.state.wheelHandler.onWheel} 
                style={{top:`${this.state.headerTop}px`, height: this.props.headerHeight}} 
                className="catalog-header-holder">
                {this.props.headerRenderer()}
              </div>
                :
              <div key="table-mini-header" className="search-page-right-block-new--mini-header-holder">
                {this.props.miniHeaderRenderer()}
              </div>
            
          ]
            :
          null
        }
      </div>
    );
  }
});

module.exports = SizeHoc(CatalogPageTableNew);
