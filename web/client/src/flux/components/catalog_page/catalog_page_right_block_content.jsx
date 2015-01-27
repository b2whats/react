'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var CatalogSearch = require('./catalog_search.jsx');
/* jshint ignore:end */

var CatalogPageRightBlockContent = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div className="search-page-right-block">
        <CatalogSearch />
      </div>
    );
  }
});

module.exports = CatalogPageRightBlockContent;