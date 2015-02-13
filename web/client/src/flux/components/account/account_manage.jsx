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
      <div className="account-manage">
        <div className="vm h-30px">
          <span className="-header">Добавить прайс лист</span>
          <span className="-button-group">
            <button className="-left">Розничный прайс</button>
            <button className="-right">Оптовый прайс</button>
          </span>

        </div>
      </div>
    );
  }
});

module.exports = AccountManage;
