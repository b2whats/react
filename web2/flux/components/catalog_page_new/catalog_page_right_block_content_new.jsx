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
  
  render () {
    return (
      <div className="search-page-right-block-new">
        <CatalogSearch show_pager={false}/>
        <CatalogPageTableNew />
      </div>
    );
  }
});

module.exports = CatalogPageRightBlockContentNew;