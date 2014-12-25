'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DefaultPageSearchBlock = require('./default_page_search_block.jsx');
/* jshint ignore:end */

var DefaultPage = React.createClass({
  mixins: [PureRenderMixin],
  
  render () {
    return (
    <div className="default-page">
      <div className="default-page-abs">
        <div className="hfm-wrapper default-page-search-height">
          <div className="default-page-wrapper default-page-search-height">
            <div className="default-page-content big-search-block entire-width">
              <div className="default-page-logo big-logo"><span className="ap-color fl">Auto</span><span className="as-color fb">Giper</span></div>
              
              <DefaultPageSearchBlock className="big-search-block-block autoparts"/>
              <DefaultPageSearchBlock className="big-search-block-block autoservices" />
            </div>
          </div>
        </div>      
      </div>
    </div>
    );
  }
});

module.exports = DefaultPage;
