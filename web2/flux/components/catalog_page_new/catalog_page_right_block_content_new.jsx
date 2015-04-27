'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var CatalogSearch = require('../catalog_page/catalog_search.jsx');
var CatalogPageTableNew = require('./catalog_page_table_new.jsx');
/* jshint ignore:end */

var CatalogPageRightBlockContentNew = React.createClass({

  mixins: [PureRenderMixin],
  
  getInitialState: function() {
    return {
      startRow: null
    };
  },

  _showFilters() {
    this.setState({startRow: 0}, () => this.setState({startRow: null}));
  },

  render_filters() {
    return (
      <CatalogSearch show_pager={false} />
    );
  },

  render_mini_header() {
    return (
      <div className="search-page-right-block-new--mini-header">
        <a onClick={this._showFilters} className="ap-link us-n" href="javascript:void(0)">Показать фильтры</a>
      </div>
    );
  },

  render () {
    return (
      <div className="search-page-right-block-new">
        {/*<CatalogSearch show_pager={false}/>*/}
        <CatalogPageTableNew 
          headerHeight={185}
          miniHeaderHeight={40}
          startRow={this.state.startRow} 
          miniHeaderRenderer={this.render_mini_header}
          headerRenderer={this.render_filters} />
      </div>
    );
  }
});

module.exports = CatalogPageRightBlockContentNew;