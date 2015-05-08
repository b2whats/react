const React = require('react/addons');
const PropTypes = React.PropTypes;

const PureRenderMixin = React.addons.PureRenderMixin;
const sizeHoc = require('components/hoc/size_hoc.js');

const Link = require('components/link.jsx');

const ReactWheelHandler = require('fixed-data-table-ice/internal/ReactWheelHandler');
const PureRenderer = require('components/hoc/pure_renderer.jsx');
const anim = require('utils/anim.js');


const CatalogPageTableHolder = require('./catalog_page_table_holder.jsx');

const K_SCROLL_HEADER_DEBOUNCE = 20;
const K_SCROLL_HEADER_DEBOUNCE_EPS = 2;

const styleEmpty = {}; // стили а не пропажа элемента чтобы не терять Wheel Event
const styleInvisible = {visibility: 'hidden'};


const CatalogPageTableNew = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    startRow: PropTypes.number,
    headerHeight: PropTypes.number,
    miniHeaderHeight: PropTypes.number
  },

  getInitialState() {
    return {
      headerTop: 0,
      wheelHandler: null,
      showMainHeader: true,
      startRow: this.props.startRow
    };
  },

  _getRowObjectAt(i) {
    if (i === 0) return null;
    return this.props.getRowObjectAt(i-1);
  },

  _getRowClassNameAt(i) {
    if (i === 0) return null;
    if (this.props.getRowClassNameAt) {
      return this.props.getRowClassNameAt(i-1);
    }
  },

  _getRowHeight(index) {
    return index===0 ? this.props.headerHeight : this.props.rowHeight;
  },

  // ---------------Логика для хедера чтобы уплывал и чтобы на нем скрол работал ---------------------
  // для передавать события onWheel с хедера напрямую в табличку
  _onReactWheelHandlerChanged(wheelHandler) {
    if (this.isMounted) {
      this.setState({wheelHandler});
    }
  },

  _onVisibleRowsChanged(height, verticalScrollState) {
    const scrollState = verticalScrollState || this.verticalScrollState;
    if(!scrollState) {
      return;
    }

    console.log(height, verticalScrollState);
  },

  _onHeightChanged(h) {
    this._onVisibleRowsChanged(h);
  },

  _onTableScroll(x, y, verticalScrollState) {
    if(verticalScrollState) {
      this._onVisibleRowsChanged(this.props.height, verticalScrollState);
      this.verticalScrollState = verticalScrollState;
    }

    if (this.isMounted) {
      let headerTop = Math.min(y, this.props.headerHeight + K_SCROLL_HEADER_DEBOUNCE);

      if (y < this.props.headerHeight + K_SCROLL_HEADER_DEBOUNCE || headerTop !== -this.state.headerTop) {
        // не обновлять state когда хедер уже скрыт
        this.setState({headerTop: -headerTop});
      }

      let showMainHeader = this.state.showMainHeader;
      if (this.state.showMainHeader === true) {
        if (-headerTop < -(this.props.headerHeight - this.props.miniHeaderHeight + K_SCROLL_HEADER_DEBOUNCE_EPS)) {
          showMainHeader = false;
        }
      } else {
        if (-headerTop > -(this.props.headerHeight - this.props.miniHeaderHeight - K_SCROLL_HEADER_DEBOUNCE_EPS)) {
          showMainHeader = true;
        }
      }
      if (showMainHeader !== this.state.showMainHeader) {
        this.setState({showMainHeader: showMainHeader});
      }
    }
  },

  _cellRenderer(cellData: any, cellDataKey: string, rowData: object, rowIndex: number, columnData: any, width: number) {
    return this.props.cellRenderer(cellDataKey, rowData);
  },

  // ---------------------------------------------------------------------------------------------------
  componentWillReceiveProps(nextProps) {
    const K_ANIM_TIME = 300;

    if (nextProps.startRow!==null && this.props.startRow===null) {
      let rowToScroll = nextProps.startRow;
      //this._onTableScroll(0, 0);
      let animStartHeaderPosition = -(this.props.headerHeight - this.props.miniHeaderHeight);
      this.setState({headerTop: animStartHeaderPosition});
      let isTopStarted = false;
      anim(K_ANIM_TIME, animStartHeaderPosition, 0, 'ease_out_cubic',
        (v, t) => {
          this.setState({headerTop: v});
          if (t > 0.0 && !isTopStarted) {
            isTopStarted = true;
            this.setState({startRow: rowToScroll}, () => this.setState({startRow: null}));
          }
          return true;
        });
    }

    if (nextProps.height !== this.props.height) {
      this._onHeightChanged(nextProps.height);
    }
  },

  render() {
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
              overflowY={'auto'} />,

            <div
              key="table-header"
              onWheel={this.state.wheelHandler && this.state.wheelHandler.onWheel}
              style={{top: `${this.state.headerTop}px`, height: this.props.headerHeight}}
              className="catalog-header-holder">
              <PureRenderer render={this.props.headerRenderer} />
            </div>,

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


module.exports = sizeHoc(CatalogPageTableNew);
