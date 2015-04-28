'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var CatalogSearch = require('../catalog_page/catalog_search.jsx');
var CatalogPageTableNew = require('./catalog_page_table_new.jsx');
/* jshint ignore:end */

import RafStateUpdate from 'components/hoc/raf_hoc.js';

var catalog_data_store = require('stores/catalog_data_store.js');

const kMIN_SIZE = 557;

@RafStateUpdate(() => ({
  catalog_results: catalog_data_store.get_catalog_results()
}), catalog_data_store)
export class CatalogPageRightBlockContentNew extends React.Component {
  
  
  //описание столбцов
  columns = [
    {
      dataKey: "num",
      fixed: true,
      label: "",
      width: 50,
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

  constructor(props) {
    super(props);
    this.state = {startRow: null};
  }
  
  cellRenderer =  (cellDataKey: string, rowData: object)  => {
    
    return (<div>{this.props.catalog_results ? 'привет мир' : ''}</div>);
  }

  _showFilters = () => {
    //так отркутить на начало
    this.setState({startRow: 0}, () => this.setState({startRow: null}));
  }

  render_header = () => {
    return (
      <CatalogSearch filter_new_type={true} show_pager={false} />
    );
  }

  render_mini_header = () => {
    return (
      <div className="search-page-right-block-new--mini-header">
        <a onClick={this._showFilters} className="ap-link us-n">Показать фильтры</a>
      </div>
    );
  }

  getRowObjectAt = (i) => {
    return this.props.catalog_results && this.props.catalog_results.get(i);
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props.catalog_results === nextProps.catalog_results);  
  }

  render () {    
    const kROW_HEIGHT = 112;
    const kHEADER_HEIGHT = 185;
    const kMINI_HEADER_HEIGHT = 40;

    

    console.log(this.props.catalog_results && this.props.catalog_results.size || 0);

    return (
      <div className="search-page-right-block-new">
        <CatalogPageTableNew
          columns = {this.columns} 
          cellRenderer = {this.cellRenderer}
          getRowObjectAt = {this.getRowObjectAt}
          rowsCount = {this.props.catalog_results && this.props.catalog_results.size || kMIN_SIZE}
          headerHeight = {kHEADER_HEIGHT}
          miniHeaderHeight = {kMINI_HEADER_HEIGHT}
          startRow = {this.state.startRow} 
          rowHeight = {kROW_HEIGHT}
          miniHeaderRenderer = {this.render_mini_header}
          headerRenderer = {this.render_header} />
      </div>
    );
  }
};

//module.exports = CatalogPageRightBlockContentNew;