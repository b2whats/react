'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');

var SearchPageAutoPartTable = require('./search_page_auto_part_table.jsx');
var SearchPageAutoServiceTable = require('./search_page_autoservice_table.jsx');
/* jshint ignore:end */

var SearchPageRightBlockContent = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div style={{left : '38%'}} className="search-page-right-block">
        <SearchPageAutoPartTable />
        <hr className="search-page-hr" />
        <SearchPageAutoServiceTable />            
      </div>
    );
  }
});

module.exports = SearchPageRightBlockContent;