'use strict';
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';

import CatalogSearch from '../catalog_page/catalog_search.jsx';
import CatalogPageTableNew from './catalog_page_table_new.jsx';

import rafStateUpdate from 'components/hoc/raf_state_update.js';
import {columns, cellRenderer, getRowClassNameAt} from './catalog_items_renderer.js'

import catalogDataStore from 'stores/catalog_data_store.js';

const kMIN_DEFAULT_ROWS_SIZE = 0;

@controllable(['forceUpdateCounter', 'startRow'])
@rafStateUpdate(() => ({
  catalogResults: catalogDataStore.get_catalog_results()
}), catalogDataStore)
export default class CatalogPageRightBlockContentNew extends Component {
  
  static propTypes = {
    catalogResults: PropTypes.any.isRequired,
    forceUpdateCounter: PropTypes.number.isRequired,
    startRow: React.PropTypes.oneOfType([PropTypes.number, PropTypes.any]),
  }

  static defaultProps = {
    forceUpdateCounter: 0,
    startRow: null,
  };

  //описание столбцов
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
    if(this.props.onStartRowChange) {
      this.props.onStartRowChange(0); //отмотать на 0 роу (потом подправить код таблички чтоб правильно мотала на любые роу - там косяк с офсетом изза хедера)
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
    if(this.props.onForceUpdateCounterChange) {
      this.props.onForceUpdateCounterChange(this.props.forceUpdateCounter + 1);
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.catalogResults !== nextProps.catalogResults) {
      this._updateTableView();
    }
  }

  componentDidUpdate (prevProps) {
    if(this.props.startRow!==null) {
      if(this.props.onStartRowChange) {
        this.props.onStartRowChange(null); //we need to reset startRow after rendering complete so after we can reset to same row
      }
    }
  }

  render () {
    const kROW_HEIGHT = 112;
    const kHEADER_HEIGHT = 185;
    const kMINI_HEADER_HEIGHT = 40;

    return (
      <div className="search-page-right-block-new">
        <CatalogPageTableNew

          forceUpdateCounter={this.props.forceUpdateCounter} //прокинуто везде где надо перерисовать данные
          columns = {this._columns} 
          cellRenderer = {this._cellRenderer}
          getRowObjectAt = {this._getRowObjectAt}
          getRowClassNameAt={this._getRowClassNameAt}
          rowsCount = {this.props.catalogResults && this.props.catalogResults.size || kMIN_DEFAULT_ROWS_SIZE}
          headerHeight = {kHEADER_HEIGHT}
          miniHeaderHeight = {kMINI_HEADER_HEIGHT}
          startRow = {this.props.startRow} 
          rowHeight = {kROW_HEIGHT}
          miniHeaderRenderer = {this._renderMiniHeader}
          headerRenderer = {this._renderHeader} />
      </div>
    );
  }
};
