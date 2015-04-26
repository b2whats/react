'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var CatalogSearch = require('../catalog_page/catalog_search.jsx');
//var CatalogPageTable = require('./catalog_page_table.jsx');
/* jshint ignore:end */

var CatalogPageRightBlockContentNew = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div className="search-page-right-block">
        <CatalogSearch show_pager={false}/>
        
      </div>
    );
  }
});

module.exports = CatalogPageRightBlockContentNew;