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


//var CatalogPageRightBlockContentNew = React.createClass({
@RafStateUpdate(() => ({
  catalog_results: catalog_data_store.get_catalog_results(),
  results_count:   catalog_data_store.get_results_count(),
}), catalog_data_store)
export class CatalogPageRightBlockContentNew extends React.Component {
  //mixins: [PureRenderMixin],
  constructor(props) {
    super(props);
    this.state = {startRow: null};
  }

  _showFilters = () => {
    //так отркутить на начало
    this.setState({startRow: 0}, () => this.setState({startRow: null}));
  }

  render_filters = () => {
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

  render () {
    const kROW_HEIGHT = 112;
    const kHEADER_HEIGHT = 185;
    const kMINI_HEADER_HEIGHT = 40;

    return (
      <div className="search-page-right-block-new">
        <CatalogPageTableNew 
          headerHeight={kHEADER_HEIGHT}
          miniHeaderHeight={kMINI_HEADER_HEIGHT}
          startRow={this.state.startRow} 
          rowHeight={kROW_HEIGHT}
          miniHeaderRenderer={this.render_mini_header}
          headerRenderer={this.render_filters} />
      </div>
    );
  }
};

//module.exports = CatalogPageRightBlockContentNew;