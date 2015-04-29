'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var SizeHoc = require('components/hoc/size_hoc.js');

var Link = require('components/link.jsx');

var ReactWheelHandler = require('fixed-data-table-ice/internal/ReactWheelHandler');
var PureRenderer = require('components/hoc/pure_renderer.jsx');
var anim = require('utils/anim.js');


var CatalogPageTableHolder = require('./catalog_page_table_holder.jsx');

var kSCROLL_HEADER_DEBOUNCE = 20;
var kSCROLL_HEADER_DEBOUNCE_EPS = 2;

var CatalogPageTableNew = React.createClass({
  mixins: [PureRenderMixin],
  
  getInitialState() {
    return {
      headerTop: 0,
      wheelHandler: null,
      showMainHeader: true,
      startRow: this.props.startRow,
    };
  },

  _getRowObjectAt(i) {
    if(i === 0) return null;
    return this.props.getRowObjectAt(i-1);
  },

  _getRowClassNameAt(i) {
    if(i === 0) return null;
    if(this.props.getRowClassNameAt) {
      return this.props.getRowClassNameAt(i-1);
    }
  },

  _getRowHeight(index) {
    return index===0 ? this.props.headerHeight : this.props.rowHeight;
  },

  //---------------Логика для хедера чтобы уплывал и чтобы на нем скрол работал ---------------------
  //для передавать события onWheel с хедера напрямую в табличку
  _onReactWheelHandlerChanged(wheelHandler) {
    if(this.isMounted) {
      this.setState({wheelHandler});
    }
  },

  _onTableScroll(x, y) {
    if(this.isMounted) {
      var header_top = Math.min(y, this.props.headerHeight + kSCROLL_HEADER_DEBOUNCE);

      if(y < this.props.headerHeight + kSCROLL_HEADER_DEBOUNCE || header_top !== -this.state.headerTop) {
        //не обновлять state когда хедер уже скрыт
        this.setState({headerTop:-header_top});
      }
    
      var show_main_header = this.state.showMainHeader; 
      if(this.state.showMainHeader === true) {
        if (-header_top < -(this.props.headerHeight - this.props.miniHeaderHeight + kSCROLL_HEADER_DEBOUNCE_EPS)) {
          show_main_header = false;
        }
      } else {
        if (-header_top > -(this.props.headerHeight - this.props.miniHeaderHeight -  kSCROLL_HEADER_DEBOUNCE_EPS)) {
          show_main_header = true;
        }
      }
      if(show_main_header !== this.state.showMainHeader) {
        this.setState({showMainHeader: show_main_header});
      }
    }
  },

  _cellRenderer(cellData: any, cellDataKey: string, rowData: object, rowIndex: number, columnData: any, width: number) {
    return this.props.cellRenderer(cellDataKey, rowData);
  },

  //---------------------------------------------------------------------------------------------------
  componentWillReceiveProps(nextProps) {
    const kANIM_TIME = 300;

    if(nextProps.startRow!==null && this.props.startRow===null) {
      this._onTableScroll(0,0);
      var anim_start_header_position = -(this.props.headerHeight - this.props.miniHeaderHeight);
      this.setState({headerTop: anim_start_header_position});
      var is_top_started = false;
      anim(kANIM_TIME, anim_start_header_position, 0, 'ease_out_cubic', 
        (v, t) => {
          this.setState({headerTop: v});
          if(t > 0.0 && !is_top_started) {
            is_top_started = true;
            this.setState({startRow: 0}, () => this.setState({startRow: null}));
          }
          return true;
        });
    }
  },

  render () {
    return (
      <div className="catalog-page-table-new">
        {this.props.width && this.props.height ?
          [
            <CatalogPageTableHolder
              key="table"
              forceUpdateCounter={this.props.forceUpdateCounter}
              width={Math.floor(this.props.width)}
              height={Math.floor(this.props.height)}
              rowHeight={this._getRowHeight(1)}
              rowHeightGetter={this._getRowHeight}
              scrollToRow={this.state.startRow}
              onScroll={this._onTableScroll}
              onReactWheelHandlerChanged={this._onReactWheelHandlerChanged}
              
              rowsCount={this.props.rowsCount}
              rowGetter={this._getRowObjectAt}
              rowClassNameGetter={this._getRowClassNameAt}
              columns={this.props.columns}
              cellRenderer = {this._cellRenderer}
              
              overflowX={'auto'}
              overflowY={'auto'} />
            ,            
            <div 
              key="table-header" 
              onWheel={this.state.wheelHandler && this.state.wheelHandler.onWheel} 
              style={{top:`${this.state.headerTop}px`, height: this.props.headerHeight}} 
              className="catalog-header-holder">
              <PureRenderer render={this.props.headerRenderer} />
            </div>
            ,
            <div 
              key="table-mini-header" 
              style={this.state.showMainHeader ? styleInvisible : styleEmpty}
              onWheel={this.state.wheelHandler && this.state.wheelHandler.onWheel} 
              className="search-page-right-block-new--mini-header-holder">
              <PureRenderer render={this.props.miniHeaderRenderer} />
            </div>
          ]
            :
          null
        }
      </div>
    );
  }
});

const styleEmpty = {};
const styleInvisible = {visibility: 'hidden'};

module.exports = SizeHoc(CatalogPageTableNew);
