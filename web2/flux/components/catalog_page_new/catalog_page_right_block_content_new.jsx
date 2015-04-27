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
  
  render_filters() {
    return (
      <CatalogSearch show_pager={false} />
    );
  },

  render_show_filters() {
  },

  render () {
    return (
      <div className="search-page-right-block-new">
        {/*<CatalogSearch show_pager={false}/>*/}
        <CatalogPageTableNew 
          headerHeight={185} 
          headerRenderer={this.render_filters} />
      </div>
    );
  }
});

module.exports = CatalogPageRightBlockContentNew;