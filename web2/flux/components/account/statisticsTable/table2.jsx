import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';

import CatalogSearch from './search.jsx';
import IceFixedTable from 'components/controls/fixed_table/ice_fixed_table.jsx';



import rafStateUpdate from 'components/hoc/raf_state_update.js';
import {columns, cellRenderer, getRowClassNameAt} from './cells2.js';


import catalogDataStore from 'stores/catalog_data_store_new.js';
import statisticsStore from 'stores/admin/statistics_store.js';
import catalogDataActionNew from 'actions/catalog_data_actions_new.js';

import _ from 'underscore';

const K_MIN_DEFAULT_ROWS_SIZE = 0;
const K_SCROLL_EVENT_THROTTLE_TIMEOUT = 0;

@controllable(['forceUpdateCounter', 'startRow'])
@rafStateUpdate(() => ({
  orderStatisticsSubscribe: statisticsStore.getOrderStatisticsSubscribe(),
}), catalogDataStore, statisticsStore)
export default class CatalogPageRightBlockContentNew extends Component {


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
    return this.props.orderStatisticsSubscribe && this.props.orderStatisticsSubscribe.get(i);
  }

  _getRowClassNameAt = (i) => {
    return getRowClassNameAt(i, i === this.props.hoveredRowIndex || i === this.props.hoveredMapRowIndex, i === this.props.firstInvisibleRowIndex);
  }

  _renderHeader = (w) => {
    return cellRenderer('header', w);
  }

  _onShowFiltersClick = () => {
    this._resetTableToStartRow();
  }

  _renderMiniHeader = (w) => {
    return cellRenderer('header', w);
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
    const K_ROW_HEIGHT = 60;
    const K_HEADER_HEIGHT = 41;
    const K_MINI_HEADER_HEIGHT = 40;
    const ROW_COUNT = this.props.orderStatisticsSubscribe && this.props.orderStatisticsSubscribe.size || K_MIN_DEFAULT_ROWS_SIZE;
    const h = ROW_COUNT * K_ROW_HEIGHT + K_HEADER_HEIGHT;
    const heightTable = h > 400 ? 400 : h;
//console.log(this.props.orderStatistics.toJS());
    return (
      <div className="mB50">
        {this.props.orderStatisticsSubscribe.size > 0 &&
          <div>
            <hr className="hr m50-0"/>
            <h3 className="fs20 fw-n m20-0">Таблица показов телефона </h3>
            <IceFixedTable
              height={heightTable}
              className="w100% p-r o-h"
              onVisibleRowsChange={this._onVisibleRowsChange}
              onRowMouseEnter={this._onRowMouseEnter}
              onRowMouseLeave={this._onRowMouseLeave}
              forceUpdateCounter={this.props.forceUpdateCounter} //прокинуто везде где надо перерисовать данные
              columns = {this._columns}
              cellRenderer = {this._cellRenderer}
              getRowObjectAt = {this._getRowObjectAt}
              getRowClassNameAt={this._getRowClassNameAt}
              rowsCount = {ROW_COUNT}
              headerHeight = {K_HEADER_HEIGHT}
              miniHeaderHeight = {K_MINI_HEADER_HEIGHT}
              startRow = {this.props.startRow}
              rowHeight = {K_ROW_HEIGHT}
              miniHeaderRenderer = {this._renderMiniHeader}
              headerRenderer = {this._renderHeader} />
          </div>
        }
      </div>
    );
  }
}
