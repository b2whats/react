'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Dropzone = require('components/forms_element/dropzone.js');
var Selector = require('./selector.jsx');
/* jshint ignore:end */

var account_manage_actions = require('actions/admin/account_manage_actions.js');
var account_manage_store = require('stores/admin/account_manage_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  loaded: account_manage_store.get_loaded(),
  errors: account_manage_store.get_errors(),
  file_name: account_manage_store.get_file_name(),
}),
account_manage_store /*observable store list*/);


var AccountManage = React.createClass({
  /*
  propTypes: {
    className: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired
  },
  */
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_drop(files) {
    if(files.length > 0) {
      var form_data = new FormData();
      form_data.append('price[]', files[0], files[0].name);        
      account_manage_actions.upload_price_list(form_data, 0, files[0].name);
    }
  },

  render () {
    var Errors = this.state.errors.map((e,index) => 
      <span key={index} className="-upload-error vm">
        <span>
          Ошибка загрузки файла {this.state.file_name}: {e.get('message')}
        </span>
      </span>).toJS();

    return (
      <div className="account-manage">
        <div className="vm h-30px">
          <span className="-header mr-20px">Добавить прайс лист</span>
          <span className="-button-group">
            <button className="-left">Розничный прайс</button>
            <button className="-right">Оптовый прайс</button>
          </span>
        </div>

        <Selector className="m-top-20px">
          <div title={'Загрузить файл XLSX или CSV'} itemBodyClassName="-item_1" className="vm h-50px m-20px">
            <Dropzone onDrop={this.on_drop}>
              <span className="-button-load">Загрузить файл</span>
            </Dropzone>
            {this.state.loaded &&
              <span className="-upload-sucseed vm">
                <span>Файл {this.state.file_name} успешно загружен</span>
              </span>
            }
            {Errors}        
          </div>
          <div title="kjhjksdhfkjhsd" itemBodyClassName="-item_2" className="vm m-20px">
            <h3>dfsfsdf</h3>
          </div>
        </Selector>


      </div>
    );
  }
});

module.exports = AccountManage;
