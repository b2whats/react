'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Dropzone = require('components/forms_element/dropzone.js');
/* jshint ignore:end */

var AccountManage = React.createClass({
  /*
  propTypes: {
    className: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired
  },
  */

  mixins: [PureRenderMixin],

  on_drop() {
    

    
  },

  render () {

    return (
      <div className="account-manage">
        <div className="vm h-30px">
          <span className="-header mr-20px">Добавить прайс лист</span>
          <span className="-button-group">
            <button className="-left">Розничный прайс</button>
            <button className="-right">Оптовый прайс</button>
          </span>
        </div>
        <div className="m-top-20px">
          <Dropzone onDrop={this.on_drop}>
            <span className="-button-load">Загрузить файл</span>
          </Dropzone>
        </div>
      </div>
    );
  }
});

module.exports = AccountManage;
