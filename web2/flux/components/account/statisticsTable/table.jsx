import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';

import CatalogSearch from './search.jsx';
import IceFixedTable from 'components/controls/fixed_table/ice_fixed_table.jsx';



import rafStateUpdate from 'components/hoc/raf_state_update.js';
import {columns, cellRenderer, getRowClassNameAt} from './cells.js';
import statisticsActions from 'actions/statisticsActions.js';

import catalogDataStore from 'stores/catalog_data_store_new.js';
import statisticsStore from 'stores/admin/statistics_store.js';
import catalogDataActionNew from 'actions/catalog_data_actions_new.js';

import _ from 'underscore';

const K_MIN_DEFAULT_ROWS_SIZE = 0;
const K_SCROLL_EVENT_THROTTLE_TIMEOUT = 0;

@controllable(['forceUpdateCounter', 'startRow'])
@rafStateUpdate(() => ({
  catalogResults: catalogDataStore.getSortedData(),
  orderStatistics: statisticsStore.getOrderStatistics(),
  hoveredRowIndex: catalogDataStore.getHoveredRowIndex(),
  hoveredMapRowIndex: catalogDataStore.getMapHoveredRowIndex(),
  firstInvisibleRowIndex: catalogDataStore.getFirstInvisibleRowIndex(),
  mapInfo: catalogDataStore.getMapInfo(),
  search: catalogDataStore.getSearch()
}), catalogDataStore, statisticsStore)
export default class CatalogPageRightBlockContentNew extends Component {

  static propTypes = {
    catalogResults: PropTypes.any.isRequired,
    forceUpdateCounter: PropTypes.number.isRequired,
    onForceUpdateCounterChange: PropTypes.func,
    startRow: React.PropTypes.oneOfType([PropTypes.number, PropTypes.any]),
    onStartRowChange: PropTypes.func,
    hoveredRowIndex: PropTypes.number,
    hoveredMapRowIndex: PropTypes.number,
    firstInvisibleRowIndex: PropTypes.number,
    mapInfo: PropTypes.any
  }

  static defaultProps = {
    forceUpdateCounter: 0,
    startRow: null
  }

  _columns = columns;

  constructor(props) {
    super(props);

    if (K_SCROLL_EVENT_THROTTLE_TIMEOUT > 0) {
      this._callUpdateVisibleRows = _.throttle(this._callUpdateVisibleRows, K_SCROLL_EVENT_THROTTLE_TIMEOUT);
    }
  }


  _cellRenderer = (cellDataKey, rowData, rowIndex) => {
    return cellRenderer(cellDataKey, rowData, rowIndex);
  }

  _getRowObjectAt = (i) => {
    return this.props.orderStatistics && this.props.orderStatistics.get(i);
  }

  _getRowClassNameAt = (i) => {
    return getRowClassNameAt(i, i === this.props.hoveredRowIndex || i === this.props.hoveredMapRowIndex, i === this.props.firstInvisibleRowIndex);
  }

  _renderHeader = () => {
    return (
      <CatalogSearch filter_new_type={true} show_pager={false} />
    );
  }

  _onShowFiltersClick = () => {
    this._resetTableToStartRow();
  }

  _renderMiniHeader = () => {
    return (
      <div className="search-page-right-block-new--mini-header">
        <a onClick={this._onShowFiltersClick} style={{pointerEvents: 'initial'}} className="ap-link us-n">Показать поиск</a>
      </div>
    );
  }

  _resetTableToStartRow = () => {
    if (this.props.onStartRowChange) {
      this.props.onStartRowChange(0); // отмотать на 0 роу (потом подправить код таблички чтоб правильно мотала на любые роу - там косяк с офсетом изза хедера)
    }
  }


  _updateTableView = () => {
    if (this.props.onForceUpdateCounterChange) {
      this.props.onForceUpdateCounterChange(this.props.forceUpdateCounter + 1);
    }
  }

  // @вынесена так как в зависмости от K_SCROLL_EVENT_THROTTLE_TIMEOUT парамера может быть сделана throttle вариантом
  _callUpdateVisibleRows = (visibleRowFirst, visibleRowLast) =>
    catalogDataActionNew.visibleRowsChange(visibleRowFirst, visibleRowLast);

  _onVisibleRowsChange = (visibleRowFirst, visibleRowLast) => {
    // console.log('n', visibleRowFirst, visibleRowLast);
    this._callUpdateVisibleRows(visibleRowFirst, visibleRowLast);
  }

  _onRowMouseEnter = (index) => {
    //console.log(index);
    catalogDataActionNew.rowHover(index, true);
  }

  _onRowMouseLeave = (index) =>
    catalogDataActionNew.rowHover(index, false);




  componentDidUpdate(prevProps) {
    if (this.props.startRow!==null) {
      if (this.props.onStartRowChange) {
        this.props.onStartRowChange(null); // we need to reset startRow after rendering complete so after we can reset to same row
      }
    }
  }

  render() {
//console.log(this.props.catalogResults.toJS());
    const K_ROW_HEIGHT = 40;
    const K_HEADER_HEIGHT = 55;
    const K_MINI_HEADER_HEIGHT = 40;
console.log(this.props.orderStatistics.toJS());
    return (
      <div className="">
        <IceFixedTable
          className="w100% h400px p-r o-h "
          onVisibleRowsChange={this._onVisibleRowsChange}
          onRowMouseEnter={this._onRowMouseEnter}
          onRowMouseLeave={this._onRowMouseLeave}
          forceUpdateCounter={this.props.forceUpdateCounter} //прокинуто везде где надо перерисовать данные
          columns = {this._columns}
          cellRenderer = {this._cellRenderer}
          getRowObjectAt = {this._getRowObjectAt}
          getRowClassNameAt={this._getRowClassNameAt}
          rowsCount = {this.props.orderStatistics && this.props.orderStatistics.size || K_MIN_DEFAULT_ROWS_SIZE}
          headerHeight = {K_HEADER_HEIGHT}
          miniHeaderHeight = {K_MINI_HEADER_HEIGHT}
          startRow = {this.props.startRow}
          rowHeight = {K_ROW_HEIGHT}
          miniHeaderRenderer = {this._renderMiniHeader}
          headerRenderer = {this._renderHeader} />
      </div>
    );
  }
}
