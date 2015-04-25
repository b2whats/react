'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var SearchPageSearchBlock = React.createClass({
  propTypes: {
    className: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired
  },

  mixins: [PureRenderMixin],

  
  render () {

    return (
      <div className={this.props.className}>
        <div className="search-page-typeahed-holder">
          <div className="search-page-typeahed-border">
            <div className="fs11 p5-0 ta-L">
        {this.props.description}
            </div>
            {this.props.children}
          </div>
          <div className="search-page-typeahed-helper-text">
            {this.props.sample}        
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SearchPageSearchBlock;
