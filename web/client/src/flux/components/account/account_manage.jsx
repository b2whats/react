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

        <div className='m20-0'>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Действительна при установке на нашем сервис центре.
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Розничная цена
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Бесплатная доставка по МСК
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Бесплатная доставка по СПб
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Только для юр лиц
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Цена на покупку от 20 000 р
          </label>
          <label className="label--checkbox d-b m5-0">
            <input type="checkbox" className="checkbox" />
            Цена на покупку от 40 000 р.
          </label>
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
          
          <div title="Загрузить текстовую таблицу (Ctrl C + Ctrl V)" itemBodyClassName="-item_2" className="m-20px">
            <textarea placeholder="Код детали  |  Аналоги детали  |  Производитель детали  |  Марки авто  |  Наименование детали  |  Количество  |  Цена в рублях  |  Условия продажи"></textarea>
            <div className="-item2-menu">
              <span className="vm h-30px">
                <span>Состояние товара</span>

                <div className="-select-holder">
                  <select defaultValue={10} className="-select">
                    <option value={10}>10</option>
                    <option value={11}>11</option>
                  </select>
                </div>

                <span className="m-left-40px">Срок доставки</span>

                <div className="-select-holder">
                  <select defaultValue={10} className="-select">
                    <option value={10}>10</option>
                    <option value={11}>11</option>
                  </select>
                </div>
              </span>
            </div>
          </div>
          
          <div title="Создание прайс-листа на основе прайс-листа оптового поставщика" itemBodyClassName="-item_3" className="vm m-20px">
            <h3>dfsfsdf</h3>
          </div>


        </Selector>


      </div>
    );
  }
});

module.exports = AccountManage;
