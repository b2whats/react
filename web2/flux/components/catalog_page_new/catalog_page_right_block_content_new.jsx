import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';

import CatalogSearch from '../catalog_page/catalog_search.jsx';
import CatalogPageTableNew from './catalog_page_table_new.jsx';

import rafStateUpdate from 'components/hoc/raf_state_update.js';
import {columns, cellRenderer, getRowClassNameAt} from './catalog_items_renderer.js';

import catalogDataStore from 'stores/catalog_data_store_new.js';

const K_MIN_DEFAULT_ROWS_SIZE = 0;

@controllable(['forceUpdateCounter', 'startRow'])
@rafStateUpdate(() => ({
  //catalogResults: catalogDataStore.getData(),
  catalogResults: catalogDataStore.getSortedData()
}), catalogDataStore)
export default class CatalogPageRightBlockContentNew extends Component {

  static propTypes = {
    catalogResults: PropTypes.any.isRequired,
    forceUpdateCounter: PropTypes.number.isRequired,
    onForceUpdateCounterChange: PropTypes.func,
    startRow: React.PropTypes.oneOfType([PropTypes.number, PropTypes.any]),
    onStartRowChange: PropTypes.func
  }

  static defaultProps = {
    forceUpdateCounter: 0,
    startRow: null
  }

  // описание столбцов
  _columns = columns;

  constructor(props) {
    super(props);
  }

  _cellRenderer = (cellDataKey, rowData) => {
    return cellRenderer(cellDataKey, rowData);
  }

  _getRowObjectAt = (i) => {
    return this.props.catalogResults && this.props.catalogResults.get(i);
  }

  _getRowClassNameAt = (i) => {
    return getRowClassNameAt(i);
  }

  _onShowFiltersClick = () => {
    if (this.props.onStartRowChange) {
      this.props.onStartRowChange(0); // отмотать на 0 роу (потом подправить код таблички чтоб правильно мотала на любые роу - там косяк с офсетом изза хедера)
    }
  }

  _renderHeader = () => {
    return (
      <CatalogSearch filter_new_type={true} show_pager={false} />
    );
  }

  _renderMiniHeader = () => {
    return (
      <div className="search-page-right-block-new--mini-header">
        <a onClick={this._onShowFiltersClick} style={{pointerEvents: 'initial'}} className="ap-link us-n">Показать фильтры</a>
      </div>
    );
  }

  _updateTableView = () => {
    if (this.props.onForceUpdateCounterChange) {
      this.props.onForceUpdateCounterChange(this.props.forceUpdateCounter + 1);
    }
  }

  _onVisibleRowsChange = (visibleRowFirst, visibleRowLast) => {
    console.log(visibleRowFirst, visibleRowLast);
  }

  _onRowMouseEnter = (row, index) => {
    //console.log(index);
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.catalogResults !== nextProps.catalogResults) {
      this._updateTableView();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.startRow!==null) {
      if (this.props.onStartRowChange) {
        this.props.onStartRowChange(null); // we need to reset startRow after rendering complete so after we can reset to same row
      }
    }
  }

  render() {
    const K_ROW_HEIGHT = 112;
    const K_HEADER_HEIGHT = 185;
    const K_MINI_HEADER_HEIGHT = 40;

    return (
      <div className="search-page-right-block-new search-page-right-block-new--new">
        <CatalogPageTableNew
          className="catalog-page-table-new"
          onVisibleRowsChange={this._onVisibleRowsChange}
          onRowMouseEnter={this._onRowMouseEnter}
          forceUpdateCounter={this.props.forceUpdateCounter} //прокинуто везде где надо перерисовать данные
          columns = {this._columns}
          cellRenderer = {this._cellRenderer}
          getRowObjectAt = {this._getRowObjectAt}
          getRowClassNameAt={this._getRowClassNameAt}
          rowsCount = {this.props.catalogResults && this.props.catalogResults.size || K_MIN_DEFAULT_ROWS_SIZE}
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
