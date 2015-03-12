'use strict';

var _ = require('underscore');
var React = require('react/addons');
var cx = React.addons.classSet;
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Dropzone = require('components/forms_element/dropzone.js');
var Selector = require('./selector.jsx');
var PriceListSelectionBlock = require('components/test/price_list_selection_block.jsx');
/* jshint ignore:end */

var account_manage_actions = require('actions/admin/account_manage_actions.js');
var account_manage_store = require('stores/admin/account_manage_store.js');

var price_list_selector_store = require('stores/admin/price_list_selector_store.js');

var price_list_selector_actions = require('actions/admin/price_list_selector_actions.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  loaded: account_manage_store.get_loaded(),
  errors: account_manage_store.get_errors(),
  file_name: account_manage_store.get_file_name(),
  price_properties: account_manage_store.get_price_properties(),
  price_list_content: account_manage_store.get_price_list_content(),
  price_type: account_manage_store.get_price_type(),
  suppliers: price_list_selector_store.get_suppliers(),
  current_supplier_id: price_list_selector_store.get_current_supplier_id(),
}),
account_manage_store, price_list_selector_store /*observable store list*/);


var kNAME = 0;
var kVALUE = 1;
var kCHEKBOXES_LEFT = [
  ['price_if_our_service', 'Действительна при установке на нашем сервис центре.'], 
  ['price_retail', 'Розничная цена.'], 
  ['delivery_free_msk', 'Бесплатная доставка по МСК.'], 
  ['delivery_free_spb', 'Бесплатная доставка по СПб.'], 
];
var kCHECKBOXES_RIGHT = [
  ['price_only_for_legal_person', 'Только для юр.лиц'],
  ['price_above_level_0', 'Цена покупки от 20 000 р'],
  ['price_above_level_1', 'Цена покупки от 40 000 р'],
];
var ButtonGroup = require('components/forms_element/button_group.jsx');

var kGOODS_QUALITY = 'goods_quality';
var kDELIVERY_TIME = 'delivery_time';

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

      form_data.append('price', files[0], files[0].name);
      this.state.price_properties.forEach((v, k) => form_data.append(k, v));
      account_manage_actions.upload_price_list(form_data, 0, files[0].name, this.state.price_type);
    }
  },

  //e.target.checked
  on_checkbox_checked(name, e) {
    account_manage_actions.change_price_property(name, e.target.checked);
  },

  on_select_changed(name, e) {
    account_manage_actions.change_price_property(name, e.target.value);
  },

  on_string_load() {
    var kFILE_NAME = 'from_textarea';
    if (this.state.price_list_content.split('\n')[0].split(';').length == 5) {
      var blob = new Blob([this.state.price_list_content], {type : 'text/csv'});
      var form_data = new FormData();
      form_data.append('price', blob, kFILE_NAME);
      this.state.price_properties.forEach((v, k) => form_data.append(k, v));
      account_manage_actions.upload_price_list(form_data, 1, kFILE_NAME, this.state.price_type);
    } else {
      account_manage_actions.upload_error([{'message' : 'Проблема с количеством столбцов'}], kFILE_NAME);
    }
  },



  on_price_list_content_changed(e) {
    account_manage_actions.change_price_list_content(e.target.value);
  },

  on_selector_changed() {
    account_manage_actions.am_reset();
  },

  on_price_list_supplier_select_changed(e) {
    price_list_selector_actions.change_current_supplier_id(e.target.value);
  },

  save_price_list_selection_result() {
    //console.error(price_list_selector_store.get_result().toJS());
    price_list_selector_actions.save_result(this.state.current_supplier_id, price_list_selector_store.get_result().toJS(), this.state.price_type);
  },

  on_change_price_type(type) {
    console.log(type);
    account_manage_actions.change_price_type(type);
  },

  render () {
    //var kCHECKBOX_PRICE_IF_OUR_SERVICE = 'price_if_our_service';
    //var kCHECKBOX_PRICE_RETAIL = 'price_retail';
    var Errors = this.state.errors.map((e,index) =>
      <span key={index} className="-upload-error vm">
        <span>
           {e.get('message')}
        </span>
      </span>).toJS();

    return (
      <div className="account-manage">
        <div className='entire-width flex-ai-c'>
        <div>
          <span className="mR20 fs24">Добавить прайс лист</span>
          <ButtonGroup select_element_value={this.state.price_type} onChange={this.on_change_price_type}>
            <button name='type' className='btn-bg-group w130px' value='1'>Покупатель</button>
            <button name='type' className='btn-bg-group w130px' value='2'>Поставщик</button>
          </ButtonGroup>
        </div>
        <Link
          className="h_link"
          href='/account/:region_id/manage-history'
        >Итория загрузок</Link>
        </div>
        <div className="m20-0">
          <span className="vm h-30px ib">
            <span>Состояние товара</span>

            <div className="ib -select-holder">
              <select 
                value={this.state.price_properties.get(kGOODS_QUALITY)}
                onChange={_.bind(this.on_select_changed, null, kGOODS_QUALITY)} 
                className="-select">
                <option value={1}>Новые</option>
                <option value={2}>Контрактные(БУ)</option>
              </select>
            </div>

            <span className="ib m-left-40px">Срок доставки</span>

            <div className="ib -select-holder">
              <select 
                value={this.state.price_properties.get(kDELIVERY_TIME)} 
                onChange={_.bind(this.on_select_changed, null, kDELIVERY_TIME)}
                className="-select">
                <option value={1}>В наличии</option>
                <option value={2}>2-7 дней</option>
                <option value={3}>7-14 дней</option>
                <option value={4}>14-21 дня</option>
                <option value={5}>до 31 дня</option>
              </select>
            </div>
          </span>
        </div>

        <div className='m20-0'>
          <div className='d-ib va-T'>
            {_.map(kCHEKBOXES_LEFT, (v, index) => (
              <label key={index} className="label--checkbox d-b m5-0">
                <input                   
                  checked={!!this.state.price_properties.get(v[kNAME])}  
                  onChange = {_.bind(this.on_checkbox_checked, null, v[kNAME])}
                  type="checkbox" 
                  className="checkbox" />
                {v[kVALUE]}
              </label>))
            }
          </div>
          <div className='d-ib va-T mL20'>
            {_.map(kCHECKBOXES_RIGHT, (v, index) => (

              <label key={index} className="label--checkbox d-b m5-0">
                <input                   
                  checked={!!this.state.price_properties.get(v[kNAME])}  
                  onChange = {_.bind(this.on_checkbox_checked, null, v[kNAME])}
                  type="checkbox" 
                  className="checkbox" />
                {v[kVALUE]}
              </label>))
            }
          </div>
        </div>



        <Selector onChange={this.on_selector_changed} className="m-top-20px">
          <div title={'Загрузить файл XLSX или CSV'} itemBodyClassName="-item_1" className="vm h-50px m-20px">
            <Dropzone onDrop={this.on_drop}>
              <span className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0">Загрузить файл</span>
            </Dropzone>
            {this.state.loaded &&
              <span className="-upload-sucseed vm">
                <span>Файл {this.state.file_name} добавлен в очередь</span>
              </span>
            }
            {Errors}        
          </div>
          
          <div title="Загрузить текстовую таблицу (Ctrl C + Ctrl V)" itemBodyClassName="-item_2" className="m-20px">
            <textarea 
              value={this.state.price_list_content}
              onChange={this.on_price_list_content_changed}
              placeholder="Код детали  |  Аналоги детали  |  Производитель детали  |  Марки авто  |  Наименование детали  |  Количество  |  Цена в рублях  |  Условия продажи" />

            
            <div className="-item2-menu justify flex">

              <div className="ib">
                <div className="vm h-50px">
                  <button onClick={this.on_string_load} className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0">Загрузить строки</button>

                  {this.state.loaded &&
                    <span className="-upload-sucseed vm">
                      <span>Контент добавлен в очередь</span>
                    </span>
                  }
                  
                  {Errors}
                </div>
              </div>
            </div>
          </div>
          
          <div title="Создание прайс-листа на основе прайс-листа оптового поставщика" itemBodyClassName="-item_3" className="vm m-20px">
            
            <div className="m20-0">
              <span className="vm h-30px ib">
                <span>Выберите поставщика</span>

                <div className="ib -select-holder">
                  <select 
                    value={this.state.current_supplier_id}
                    onChange={this.on_price_list_supplier_select_changed} 
                    className="-select">
                    {
                      this.state.suppliers.map((s,index) => 
                        <option key={index} value={s.get('id')}>{s.get('title')}</option>).toJS()                    
                    }
                  </select>
                </div>
              </span>
            </div>


            <div>
              <PriceListSelectionBlock />
              
              <button onClick={this.save_price_list_selection_result} className="-button-load">Сохранить результат</button>
            </div>

          </div>
        </Selector>


      </div>
    );
  }
});

module.exports = AccountManage;
