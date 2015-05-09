const React = require('react/addons');
const PropTypes = React.PropTypes;

const PureRenderMixin = React.addons.PureRenderMixin;
const sizeHoc = require('components/hoc/size_hoc.js');

const Link = require('components/link.jsx');
const invariant = require('fixed-data-table-ice/internal/invariant.js');
const ReactWheelHandler = require('fixed-data-table-ice/internal/ReactWheelHandler');
const PureRenderer = require('components/hoc/pure_renderer.jsx');
const anim = require('utils/anim.js');

const debounceCore = require('fixed-data-table-ice/internal/debounceCore.js');

const CatalogPageTableHolder = require('./catalog_page_table_holder.jsx');

const K_SCROLL_HEADER_DEBOUNCE = 20;
const K_SCROLL_HEADER_DEBOUNCE_EPS = 2;

const K_HEADER_FIELD_INDEX_DELTA = 1; // для хедера пользуем первое поле таблички чтобы выше не путать нумерацию

const styleEmpty = {}; // стили а не пропажа элемента чтобы не терять Wheel Event
const styleInvisible = {visibility: 'hidden'};


const CatalogPageTableNew = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    className: PropTypes.string,
    startRow: PropTypes.number, // from which row to draw - default 0 (other values not tested yet)
    headerHeight: PropTypes.number,
    miniHeaderHeight: PropTypes.number,
    rowHeight: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
    rowsCount: PropTypes.number, // total row count
    forceUpdateCounter: PropTypes.number, // used to update pureRendered components
    columns: PropTypes.array, // columns definition columns = [{dataKey: K_KEY_COLUMN_RANK, fixed: true, label: '', width: 70},...]
    getRowObjectAt: PropTypes.func,
    getRowClassNameAt: PropTypes.func,
    cellRenderer: PropTypes.func,
    headerRenderer: PropTypes.func,
    miniHeaderRenderer: PropTypes.func,
    onVisibleRowsChange: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    onScrollEnd: PropTypes.func,
    onScrollStart: PropTypes.func
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
    return this.props.getRowObjectAt(i - K_HEADER_FIELD_INDEX_DELTA);
  },

  _getRowClassNameAt(i) {
    if (i === 0) return null;
    if (this.props.getRowClassNameAt) {
      return this.props.getRowClassNameAt(i - K_HEADER_FIELD_INDEX_DELTA);
    }
  },

  _getRowHeight(index) {
    return index===0 ? this.props.headerHeight : this.props.rowHeight;
  },

  // ---------------Логика для хедера чтобы уплывал и чтобы на нем скрол работал ---------------------
  // для передавать события onWheel с хедера напрямую в табличку
  _onReactWheelHandlerChange(wheelHandler) {
    if (this.isMounted()) {
      this.setState({wheelHandler});
    }
  },

  _onVisibleRowsChangeCall(visibleRowFirst, visibleRowLast) {
    if (this.prevVisibleRowFirst !== visibleRowFirst || this.prevVisibleRowLast!==visibleRowLast) {
      if (this.props.onVisibleRowsChange) {
        this.props.onVisibleRowsChange(visibleRowFirst, visibleRowLast);
      }

      this.prevVisibleRowFirst = visibleRowFirst;
      this.prevVisibleRowLast = visibleRowLast;
    }
  },

  _onVisibleRowsChange(height, verticalScrollState) {
    const scrollState = verticalScrollState || this.verticalScrollState; // {index: 0, offset: -154, position: 154, contentHeight: 69401}
    if (!scrollState) {
      return;
    }

    if (!this.props.rowsCount) {
      this.rowYPositions[0].rowIndex = -1; // reset
      this._onVisibleRowsChangeCall(-1, -1);
      return;
    }

    let posIndex = 0;
    let visibleRowFirst =
      this.props.miniHeaderHeight >= this._getRowHeight(scrollState.index) + scrollState.offset ? scrollState.index + 1 : scrollState.index;

    // найти последний видимый
    let visibleRowLast = scrollState.index + 1;
    let heightSum = this._getRowHeight(scrollState.index) + scrollState.offset;

    // ==<<begin position calcs for mouse over events
    this.rowYPositions[posIndex].rowIndex = Math.max(0, visibleRowFirst - K_HEADER_FIELD_INDEX_DELTA);

    if (scrollState.index === visibleRowFirst && visibleRowFirst > 0) {
      this.rowYPositions[posIndex].rowYTop = scrollState.offset;
      this.rowYPositions[posIndex].rowYBottom = heightSum;
    } else {
      this.rowYPositions[posIndex].rowYTop = heightSum;
      this.rowYPositions[posIndex].rowYBottom = heightSum + this._getRowHeight(scrollState.index + 1);
    }
    // i know that i can remove this calc this.rowYPositions[posIndex].rowYTop = scrollState.offset; upper but it's exact calc for future use
    this.rowYPositions[posIndex].rowYTop = Math.max(this.props.miniHeaderHeight, this.rowYPositions[posIndex].rowYTop);
    // end position calcs for mouse over events>>==

    for (; heightSum < this.props.height && visibleRowLast < this.props.rowsCount + K_HEADER_FIELD_INDEX_DELTA; ++visibleRowLast) {
      heightSum += this._getRowHeight(visibleRowLast);
    }
    --visibleRowLast;

    visibleRowFirst = Math.max(0, visibleRowFirst - K_HEADER_FIELD_INDEX_DELTA); // первое поле хедер
    visibleRowLast = visibleRowLast - K_HEADER_FIELD_INDEX_DELTA;

    if (visibleRowFirst > visibleRowLast) {
      if (__DEV__) {
        invariant(visibleRowLast === -1, 'first row index is less than last row index and not eq -1');
      }

      this.rowYPositions[0].rowIndex = -1; // reset
      visibleRowFirst = visibleRowLast;
    } else {
      // ==<<begin position calcs for mouse enter events
      posIndex = 1;
      for (let rowIndex = visibleRowFirst + 1; rowIndex <= visibleRowLast; ++rowIndex) {
        this.rowYPositions[posIndex].rowIndex = rowIndex;
        this.rowYPositions[posIndex].rowYTop = this.rowYPositions[posIndex - 1].rowYBottom;
        this.rowYPositions[posIndex].rowYBottom = Math.min(this.props.height, this.rowYPositions[posIndex].rowYTop + this._getRowHeight(rowIndex + K_HEADER_FIELD_INDEX_DELTA));
        ++posIndex;
      }
      this.rowYPositions[posIndex].rowIndex = -1;
      // end position calcs for mouse enter events>>==
    }

    /*
    console.log('-----------------------------------------');
    for(let i=0; this.rowYPositions[i].rowIndex >=0; ++i) {
      console.log(this.rowYPositions[i]);
    }
    */
    this._onVisibleRowsChangeCall(visibleRowFirst, visibleRowLast);
  },

  _onHeightChange(h) {
    this._onVisibleRowsChange(h);
  },

  _onRowMouseLeave() {
    if (this.props.onRowMouseLeave && this.currentRowIndex !== null) {
      this.props.onRowMouseLeave(this.currentRowIndex, this.props.getRowObjectAt(this.currentRowIndex));
      this.currentRowIndex = null;
    }
  },

  _onRowMouseEnter(rowIndex) {
    if (rowIndex !== this.currentRowIndex) {
      this._onRowMouseLeave();

      if (this.props.onRowMouseEnter) {
        this.props.onRowMouseEnter(rowIndex, this.props.getRowObjectAt(rowIndex));
      }

      this.currentRowIndex = rowIndex;
    }
  },

  _onRowMouseEnterCalc() {
    if (this.mousePosX !== null && this.mousePosY !== null) {
      let rowIndex = -1;
      for (let i = 0; this.rowYPositions[i].rowIndex >=0; ++i) {
        if (this.mousePosY >= this.rowYPositions[i].rowYTop && this.mousePosY < this.rowYPositions[i].rowYBottom) {
          rowIndex = this.rowYPositions[i].rowIndex;
          break;
        }
      }

      if (rowIndex !== -1) {
        this._onRowMouseEnter(rowIndex);
      } else {
        this._onRowMouseLeave();
      }
    }
  },

  _onMouseLeave() {
    this._onRowMouseLeave();
    this.mousePosX = null;
    this.mousePosY = null;
  },

  _onMouseMove(event) {
    const targetRect = event.currentTarget.getBoundingClientRect();
    this.mousePosX = event.clientX - targetRect.left;
    this.mousePosY = event.clientY - targetRect.top;

    if (!this.inScroll) {
      this._onRowMouseEnterCalc();
    }
  },

  _onTableScrollStart() {
    this._onRowMouseLeave();

    if (this.props.onScrollStart) {
      this.props.onScrollStart();
    }

    this.inScroll = true;
  },

  // @debounced in componentWillMount look at debounceCore call
  _onTableScrollEnd() {
    if (this.props.onScrollEnd) {
      this.props.onScrollEnd();
    }

    this._onRowMouseEnterCalc();

    this.inScroll = false;
  },

  _onTableScrollChange(x, y, verticalScrollState) {
    if (this.isMounted()) {
      if (verticalScrollState) {
        if (!this.inScroll) {
          this._onTableScrollStart();
        }

        this._onVisibleRowsChange(this.props.height, verticalScrollState);
        this.verticalScrollState = verticalScrollState;
      }

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
      this._onTableScrollEnd();
    }
  },

  _cellRenderer(cellData: any, cellDataKey: string, rowData: object, rowIndex: number, columnData: any, width: number) {
    return this.props.cellRenderer(cellDataKey, rowData);
  },

  componentWillMount() {
    const K_MAX_VISIBLE_ROWS = 100; // думаю хватит на ближайшие несколько лет
    this.mousePosX = null;
    this.mousePosY = null;

    this.rowYPositions = Array
      .from(Array(K_MAX_VISIBLE_ROWS).keys())
      .map(v => ({rowIndex: -1, rowYTop: -1000, rowYBottom: -1000}));

    this.currentRowIndex = null;
    this.inScroll = false;
    this.prevVisibleRowFirst = -1;
    this.prevVisibleRowLast = -1;
    this._onTableScrollEnd = debounceCore(this._onTableScrollEnd, 160, this);
  },

  componentWillReceiveProps(nextProps) {
    const K_ANIM_TIME = 300;

    if (nextProps.startRow!==null && this.props.startRow===null) {
      let rowToScroll = nextProps.startRow;
      // if (this.prevVisibleRowFirst


      let animStartHeaderPosition = Math.max(this.state.headerTop, -(this.props.headerHeight - this.props.miniHeaderHeight));


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
      this._onHeightChange(nextProps.height);
    }
  },

  render() {
    return (
      <div
        onMouseLeave={this._onMouseLeave}
        onMouseMove={this._onMouseMove}
        className={this.props.className}>
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
              onScroll={this._onTableScrollChange}
              onReactWheelHandlerChange={this._onReactWheelHandlerChange}

              rowsCount={this.props.rowsCount + K_HEADER_FIELD_INDEX_DELTA}
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
