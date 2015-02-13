'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var AccountManage = React.createClass({
  propTypes: {
    className: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired
  },

  mixins: [PureRenderMixin],

  
  render () {

    return (
      <div>
        <h3>upload file</h3>
      </div>
    );
  }
});

module.exports = AccountManage;
