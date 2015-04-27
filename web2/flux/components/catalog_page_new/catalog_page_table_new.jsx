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


var _ = require('underscore');
var objects = _.map(_.range(0, 1000), (i) => ({
    num: i,
    name: `name ${i}`,
    description: `description ${i}`,
}));

var columns = [
  {
    dataKey: "num",
    fixed: true,
    label: "",
    width: 50,
    cellDataGetter (key, obj) {
      console.log('kk', key, obj);
      return 'jopa';
    }
  },
  {
    dataKey: "name",
    flexGrow: 1,
    label: "",
    width: 50,
  },
  {
    dataKey: "description",
    flexGrow: 1,
    label: "",
    width: 50,
  },
];


var getObjectAt = (i) => {
  if(i === 0) return null;
  return objects[i-1];
};

var getRowClassName = (i) => {  
  return i===0 ? '--first-row' : '';
};

var renderImage = (cell_data) => (
  <div>cell_data</div>
);



var kSCROLL_HEADER_DEBOUNCE = 20;
var kSCROLL_HEADER_DEBOUNCE_EPS = 2;

var CatalogPageTableNew = React.createClass({
  mixins: [PureRenderMixin],
  
  getInitialState() {
    return {
      counter: 0,
      headerTop: 0,
      wheelHandler: null,
      showMainHeader: true,
      startRow: this.props.startRow,
    };
  },
  

  getRowHeight(index) {
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
      <div style={{backgroundColor: 'red'}} className="catalog-page-table-new">
        {this.props.width && this.props.height ?
          [
            <CatalogPageTableHolder
              key="table"
              width={Math.floor(this.props.width)}
              height={Math.floor(this.props.height)}
              rowHeight={this.getRowHeight(1)}
              rowHeightGetter={this.getRowHeight}
              scrollToRow={this.state.startRow}
              onScroll={this._onTableScroll}
              onReactWheelHandlerChanged={this._onReactWheelHandlerChanged}
              
              rowsCount={1000}
              rowGetter={getObjectAt}
              columns={columns}
              
              overflowX={'auto'}
              overflowY={'auto'} />
            ,
            this.state.showMainHeader ? 
              <div 
                key="table-header" 
                onWheel={this.state.wheelHandler && this.state.wheelHandler.onWheel} 
                style={{top:`${this.state.headerTop}px`, height: this.props.headerHeight}} 
                className="catalog-header-holder">
                <PureRenderer render={this.props.headerRenderer} />
              </div>
                :
              <div key="table-mini-header" className="search-page-right-block-new--mini-header-holder">
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

module.exports = SizeHoc(CatalogPageTableNew);
