'use strict';
import React, {PropTypes, Component} from 'react/addons';

import CatalogSearch from '../catalog_page/catalog_search.jsx';
import CatalogPageTableNew from './catalog_page_table_new.jsx';


import RafStateUpdate from 'components/hoc/raf_state_update.js';
import {columns, cellRenderer} from './catalog_items_renderer.js'

import catalogDataStore from 'stores/catalog_data_store.js';


const kMIN_DEFAULT_ROWS_SIZE =20;

@RafStateUpdate(() => ({
  catalogResults: catalogDataStore.get_catalog_results()
}), catalogDataStore)
export default class CatalogPageRightBlockContentNew extends Component {
  static propTypes = {
    catalogResults: PropTypes.any.isRequired
  }

  //описание столбцов
  _columns = columns;

  constructor(props) {
    super(props);
    this.state = {startRow: null, forceUpdateCounter: 0};
  }
  
  _cellRenderer = (cellDataKey, rowData) => { 
    return cellRenderer(cellDataKey, rowData);
  }

  _getRowObjectAt = (i) => {
    return this.props.catalogResults && this.props.catalogResults.get(i);
  }

  _onShowFiltersClick = () => {
    //так отркутить на начало
    this.setState({startRow: 0}, () => this.setState({startRow: null}));
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

  updateTableView() {
    this.setState({forceUpdateCounter: this.state.forceUpdateCounter + 1});
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.catalogResults !== nextProps.catalogResults) {
      this.updateTableView();
    }
  }

  render () {
    const kROW_HEIGHT = 112;
    const kHEADER_HEIGHT = 185;
    const kMINI_HEADER_HEIGHT = 40;
    
    return (
      <div className="search-page-right-block-new">
        <CatalogPageTableNew
          forceUpdateCounter={this.state.forceUpdateCounter} //прокинуто везде где надо перерисовать данные
          columns = {this._columns} 
          cellRenderer = {this._cellRenderer}
          getRowObjectAt = {this._getRowObjectAt}
          rowsCount = {this.props.catalogResults && this.props.catalogResults.size || kMIN_DEFAULT_ROWS_SIZE}
          headerHeight = {kHEADER_HEIGHT}
          miniHeaderHeight = {kMINI_HEADER_HEIGHT}
          startRow = {this.state.startRow} 
          rowHeight = {kROW_HEIGHT}
          miniHeaderRenderer = {this._renderMiniHeader}
          headerRenderer = {this._renderHeader} />
      </div>
    );
  }
};
