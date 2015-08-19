'use strict';

var _ = require('underscore');
var React = require('react/addons');
var cx = require('classnames');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Dropzone = require('components/forms_element/dropzone.js');
var Selector = require('./selector.jsx');
var PriceListSelectionBlock = require('components/test/price_list_selection_block.jsx');
/* jshint ignore:end */

var account_manage_actions = require('actions/admin/account_manage_actions.js');
var account_manage_store = require('stores/admin/account_manage_store.js');

var price_list_selector_store = require('stores/admin/price_list_selector_store.js');
var toggle_actions = require('actions/ToggleActions.js');
var toggle_store = require('stores/ToggleStore.js');
var price_list_selector_actions = require('actions/admin/price_list_selector_actions.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    loaded: account_manage_store.get_loaded(),
    errors: account_manage_store.get_errors(),
    file_name: account_manage_store.get_file_name(),
    price_properties: account_manage_store.get_price_properties(),
    price_list_content: account_manage_store.get_price_list_content(),
    price_type: account_manage_store.get_price_type(),
    history: account_manage_store.get_history(),
    suppliers: price_list_selector_store.get_suppliers(),
    current_supplier_id: price_list_selector_store.get_current_supplier_id(),
    price_range: price_list_selector_store.get_price_range(),
    toggle: toggle_store.getToggle(),
  }),
  account_manage_store, price_list_selector_store, toggle_store /*observable store list*/);

var kNAME = 0;
var kVALUE = 1;
var kCHEKBOXES_LEFT = [
  [
    'price_if_our_service',
    'Действительна при установке на нашем сервис центре.'
  ],
  [
    'price_retail',
    'Розничная цена.'
  ],
  [
    'delivery_free_msk',
    'Бесплатная доставка по МСК.'
  ],
  [
    'delivery_free_spb',
    'Бесплатная доставка по СПб.'
  ],
];
var kCHECKBOXES_RIGHT = [
  [
    'price_only_for_legal_person',
    'Только для юр.лиц'
  ],
  [
    'price_above_level_0',
    'Цена покупки от 20 000 р'
  ],
  [
    'price_above_level_1',
    'Цена покупки от 40 000 р'
  ],
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
  mixins: [
    PureRenderMixin,
    RafBatchStateUpdateMixin
  ],

  on_drop(files) {
    if (files.length > 0) {
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
    if (name == 'discount' && e.target.value > 99) {
      return false
    }
    account_manage_actions.change_price_property(name, e.target.value);
  },

  on_string_load() {
    var kFILE_NAME = 'from_textarea';
    if (this.state.price_list_content.split('\n')[0].split(';').length == 6) {
      var blob = new Blob([this.state.price_list_content], {type: 'text/csv'});
      var form_data = new FormData();
      form_data.append('price', blob, kFILE_NAME);
      this.state.price_properties.forEach((v, k) => form_data.append(k, v));
      account_manage_actions.upload_price_list(form_data, 1, kFILE_NAME, this.state.price_type);
    }
    else {
      account_manage_actions.upload_error([{'message': 'Проблема с количеством столбцов'}], kFILE_NAME);
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
    price_list_selector_actions.save_result(this.state.current_supplier_id, price_list_selector_store.get_result().toJS(), this.state.price_type, this.state.price_properties.toJS());
  },
  delete_price_list_selection_result() {
    price_list_selector_actions.delete_result(this.state.current_supplier_id);
  },
  on_change_price_type(type) {

    account_manage_actions.change_price_type(type);
  },
  clear_price() {
    account_manage_actions.delete_price_by_type(this.state.price_type);
  },
  toggle(val) {
    return () => {
      toggle_actions.change(val);
    }
  },
  render() {

    //var kCHECKBOX_PRICE_IF_OUR_SERVICE = 'price_if_our_service';
    //var kCHECKBOX_PRICE_RETAIL = 'price_retail';
    var Errors = this.state.errors.map((e, index) =>
      <span key={index} className="-upload-error vm">
        <span>
           {e}
        </span>
      </span>).toJS();
    var History = !!this.state.history &&
      <table className='T-p5-15 fs12'>
        {this.state.history
          .filter(el => el.get('price_type_id') == this.state.price_type)
          .map((el, index) =>
            <tr key={index} className={cx((index % 2 === 0) && 'bgc-grey-200')}>
              <td>{el.get('date')}</td>
              <td>{el.get('type')}</td>
              <td>{el.get('used')}</td>
              <td>{el.get('status')}</td>
            </tr>
        ).take(5).toArray()}
      </table>;

    return (
    <div className="account-manage">


      <div className='entire-width flex-ai-c w48%'>
        <div>
          <span className="mR20 fs24 va-M">Добавить прайс лист</span>
          <ButtonGroup select_element_value={this.state.price_type} onChange={this.on_change_price_type}>
            <button name='type' className='btn-bg-group w130px' value='1'>Розничный</button>
            <button name='type' className='btn-bg-group w130px' value='2'>Оптовый</button>
          </ButtonGroup>
        </div>
        <div className='cur-p' onClick={this.clear_price}>
          Очистить {(this.state.price_type == 1) ? 'розничный' : 'оптовый'} прайс <i className='flaticon-clear fs20'/>
        </div>
      </div>
      <div className="va-T br6 m25-0 mw540px z-depth1 p10 o-h">
        <div onClick={this.toggle('manage-instruction')} className='entire-width  flex-ai-c'>
          <span className='fs18'>Рекомендации по загрузке прайса</span>
          <span className='c-deep-purple-500 cur-p fs12 bB1d' onClick={this.toggle('manage-instruction')}>

          {(!!!this.state.toggle.get('manage-instruction')) ? 'Скрыть инструкцию' : 'Показать инструкцию'}
          </span>
        </div>
        <div className={cx(!!!this.state.toggle.get('manage-instruction') ? 'd-b' : 'd-N')}>
          <div className="entire-width fs12" onClick={this.toggle('manage-instruction')} >
            <div className="w47pr">
              <p className='lh1-4'>
                1) Система загружает <b>только 6 столбцов</b>. Проверяйте пожалуйста наличие случайных данных в других столбцах.
              </p>
              <p className='lh1-4'>
                2) Столбцы должны быть строго в определенном порядке: <b>Производитель, Код детали</b>, Наименование детали, Количество, Цена, Срок доставки(если в наличии - ставим 0). Пустых ячеек в этих шести колонках быть не должно.
              </p>
              <p className='lh1-4'>
                3) В колонках "Количество" и "Цена" должны быть целые числа без букв. То есть не допускаются значения типа "В наличии", или "10,50", или "10 руб".
              </p>
            </div>
            <div className="w47pr">
              <p className='lh1-4'>
                4) Нулевых значений в колонках "В наличии" и "Цена" быть не должно. Если у вас прайс с заказными позициями - ставим 1 в наличии и потом отдельно выбираем срок доставки для всего загружаемого файла.
              </p>
              <p className='lh1-4'>
                5) Условия продаж и доставки распространяются на каждый загружаемый файл отдельно и распространяются на все позиции именно этого файла.
              </p>
              <p className='lh1-4'>
                6) Дублирующиеся позиции в прайсе одного клиента удаляются автоматически в пользу самой свеже-загруженной позиции.
              </p>
            </div>
          </div>
        </div>
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

            {/*            <span className="ib m-left-40px">Срок доставки</span>

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
            </div>*/}


            {/* this.state.price_type == 2 &&
             <label className="label--checkbox d-ib m5-0">
             <input
             checked={!!this.state.price_properties.get('show_wholesale_price')}
             onChange = {_.bind(this.on_checkbox_checked, null, 'show_wholesale_price')}
             type="checkbox"
             className="checkbox" />
             Отображать в поиске
             </label>

             */}

          </span>
      </div>
      {(this.state.price_type == 1) &&
      <div className='m20-0'>
        <div className='d-ib va-T'>
          {_.map(kCHEKBOXES_LEFT, (v, index) => (
            <label key={index} className="label--checkbox d-b m5-0">
              <input
                checked={!!this.state.price_properties.get(v[kNAME])}
                onChange={_.bind(this.on_checkbox_checked, null, v[kNAME])}
                type="checkbox"
                className="checkbox"/>
              {v[kVALUE]}
            </label>))
          }
        </div>
        <div className='d-ib va-T mL20'>
          {_.map(kCHECKBOXES_RIGHT, (v, index) => (

            <label key={index} className="label--checkbox d-b m5-0">
              <input
                checked={!!this.state.price_properties.get(v[kNAME])}
                onChange={_.bind(this.on_checkbox_checked, null, v[kNAME])}
                type="checkbox"
                className="checkbox"/>
              {v[kVALUE]}
            </label>))
          }
        </div>
      </div>
      }

      {(this.state.price_type == 1) ?
        <Selector onChange={this.on_selector_changed} className="m-top-20px">
          <div title={'Загрузить файл XLSX или CSV'} itemBodyClassName="-item_1" classBlock=''
               className="vm h-50px m-20px" classTitle='fs16'>
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

          <div title="Загрузить текстовую таблицу (Ctrl C + Ctrl V)" itemBodyClassName="-item_2"
               classBlock={cx({"d-N" : this.state.price_type == 2})}
               className="m-20px"
               classTitle='fs16'>
            <textarea
              value={this.state.price_list_content}
              onChange={this.on_price_list_content_changed}
              placeholder="Производитель детали  |  Код детали  |  Наименование детали  |  Количество  |  Цена в рублях  |  Срок доставки"/>

            <div className="-item2-menu justify flex">

              <div className="ib">
                <div className="vm h-50px">
                  <button onClick={this.on_string_load} className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0">
                    Загрузить строки
                  </button>

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

          <div title="Создание прайс-листа на основе прайс-листа оптового поставщика" itemBodyClassName="-item_3"
               classBlock={cx({"d-N" : this.state.price_type == 2})}
               className="vm m-20px"
               classTitle='fs16'>

            <div className="m20-0">
              <span className="vm h-30px ib">
                <span>Выберите поставщика</span>

                <div className="ib -select-holder">
                  <select
                    value={this.state.current_supplier_id}
                    onChange={this.on_price_list_supplier_select_changed}
                    className="-select">
                    {
                      this.state.suppliers.map((s, index) =>
                        <option key={index} value={s.get('id')}>{s.get('name')}</option>).toJS()
                    }
                  </select>
                </div>
                <span className='va-M'>Общая скидка </span>
                <input
                  type="search"
                  onChange={_.bind(this.on_select_changed, null, 'discount')}
                  value={this.state.price_properties.get('discount')}
                  className="va-M w30px"/> %
                {this.state.price_range && this.state.price_range.has(this.state.current_supplier_id + '') &&
                <span className='cur-p c-deep-purple-500'
                      onClick={this.delete_price_list_selection_result}> Отписаться</span>
                }
                <Link
                  className="h_link mL20"
                  href={'/company/'+this.state.current_supplier_id+'/:region_id'}
                  >Карточка оптовика</Link>
              </span>
            </div>

            <div>
              <PriceListSelectionBlock save_price_list_selection_result={this.save_price_list_selection_result}/>

            </div>

          </div>

        </Selector>

        :
        <div className="vm h-50px m-20px">
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
      }






        <div className='m20-0'>
          <div className='fs20'>Последние загрузки</div>
          <hr className='hr'/>
          {History}
        </div>
      </div>
  )
    ;
  }
});

module.exports = AccountManage;
