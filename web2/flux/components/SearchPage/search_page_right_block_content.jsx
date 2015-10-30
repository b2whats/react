'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');

var SearchPageAutoPartTable = require('./search_page_auto_part_table.jsx');
var SearchPageAutoServiceTable = require('./search_page_auto_part_table1.jsx');
/* jshint ignore:end */

var SearchPageRightBlockContent = React.createClass({

  mixins: [PureRenderMixin],
  
  render () {
    console.log(this.props.routeParams)
    return (
      <div style={{left : '38%'}} className="search-page-right-block">
        {this.props.routeParams.id !== '_' && <SearchPageAutoPartTable />}

        {this.props.routeParams.service_id !== '_' && <SearchPageAutoServiceTable />}
      </div>
    );
  }
});

module.exports = SearchPageRightBlockContent;