'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = require('classnames');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var MaskedInput = require('components/forms_element/masked_input.jsx');
var YandexMapAddressSelect = require('components/yandex/yandex_map_address_select.jsx');
var ButtonGroup = require('components/forms_element/button_group.jsx');
var WorkDaysBlock = require('./work_days_block.jsx');
/* jshint ignore:end */

var region_store = require('stores/region_store.js');
var filial_address_and_work_time_store = require('stores/admin/filial_address_and_work_time_store.js');

var filial_address_and_work_time_actions = require('actions/admin/filial_address_and_work_time_actions.js');

var sass_vars = require('common_vars.json')['yandex-map'];

var kMARKER_COLOR = [
  sass_vars['auto-part-marker-color'],
  sass_vars['autoservice-marker-color']
];

/*Action*/
import ModalActions from 'actions/ModalActions.js';

const GoogleAutocomplete = require('components/google/google_autocomplete.jsx');

const sc = require('shared_constants');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(
  () => ({
    region_current: region_store.get_region_current(),
    filial_id: filial_address_and_work_time_store.get_filial_id(),
    address: filial_address_and_work_time_store.get_address(),
    coordinates: filial_address_and_work_time_store.get_coordinates(),
    metadata: filial_address_and_work_time_store.get_metadata(),
    work_time: filial_address_and_work_time_store.get_work_time(),
    type: filial_address_and_work_time_store.get_type(),
    phones: filial_address_and_work_time_store.get_phones(),
  }),
  region_store, filial_address_and_work_time_store);

var FilialAddressSelector = React.createClass({
  mixins: [
    PureRenderMixin,
    RafBatchStateUpdateMixin
  ],

  on_phone_change(index, e) {
    filial_address_and_work_time_actions.f_phone_change(index, e.target.value);
  },
  onClickCloseModal() {
    ModalActions.closeModal();
  },
  on_address_changed(address, coords, metadata) {
    filial_address_and_work_time_actions.f_address_change(address);
    filial_address_and_work_time_actions.f_coords_change(coords);
    filial_address_and_work_time_actions.f_metadata_change(metadata);
  },

  on_type_changed(type) {
    filial_address_and_work_time_actions.f_type_change(type);
  },

  on_holiday_change(index, value) {
    filial_address_and_work_time_actions.f_work_holiday_change(index, value);
  },

  on_from_change(index, value) {
    filial_address_and_work_time_actions.f_work_time_from_change(index, value);
  },
  onAddressChange(center, address) {
    //console.log(address);
    filial_address_and_work_time_actions.f_address_change(address.formatted_address);
    filial_address_and_work_time_actions.f_coords_change(center);
    filial_address_and_work_time_actions.f_metadata_change(address);
    //console.log(center, address);
  },
  onCenterChange(center) {
    filial_address_and_work_time_actions.f_coords_change(center);
  },
  on_to_change(index, value) {
    filial_address_and_work_time_actions.f_work_time_to_change(index, value);
  },
  submit_form() {
    //console.log(this.state.metadata.toJS());
    if (this.state.metadata) {
      var value = {
        filial_id: this.state.filial_id,
        address: this.state.address,
        coordinates: this.state.coordinates.toJS(),
        metadata: this.state.metadata.toJS(),
        work_time: this.state.work_time.toJS(),
        type: this.state.type,
        phones: this.state.phones.toJS(),
      };
      filial_address_and_work_time_actions.submit_form(value);
    }
    this.onClickCloseModal();
  },
  render() {
    var map_width = 400; //важно знать заранее как вариант подтянуть из sass
    var map_height = 300; //важно знать заранее как вариант подтянуть из sass
    //var address = 'Москва, Россошанская ул. д.4';

    var bounds = [
      [
        59.744465,
        30.042834
      ],
      [
        60.090935,
        30.568322
      ]
    ]; //определить например питером на случай если region_current не прогрузился
    if (this.state.region_current) {
      bounds = [
        this.state.region_current.get('lower_corner').toJS(),
        this.state.region_current.get('upper_corner').toJS()
      ];
    }

    //console.log('this.state.address, this.state.coordinates, this.state.phone',
    //             this.state.address, this.state.coordinates && this.state.coordinates.toJS(), this.state.phones.toJS());
    //console.log('metadata', this.state.metadata && this.state.metadata.toJS());

    var marker_color = kMARKER_COLOR[this.state.type - 1];


    let center = this.state.coordinates && this.state.coordinates.toJS() || [];
    return (
      <div className="ta-C w700px">
        <div className='ReactModal__Content-close flaticon-close' onClick={this.onClickCloseModal}></div>
        <h2 className='m15-0'>{(!!this.state.type) ? 'Редактирование филиала' : 'Новый филиал'}</h2>
        <ButtonGroup className='m15-0' select_element_value={this.state.type} onChange={this.on_type_changed}>
          <button className="btn-bg-group w160px" value={1}>
            <i className='svg-icon_gear mR5 va-M fs16'/>
            Автозапчасти
          </button>
          <button className="btn-bg-group w160px" value={2}>
            <i className='svg-icon_key mR5 va-M fs16'/>
            Сервис
          </button>
        </ButtonGroup>

        <div className='entire-width'>
          <div>
            {/*надо помнить что MaskedInput отличается от обычного input react тем что оно имеет односторонний бинд
             а именно только при инициализации привязывается к value и дальнейшие изменения value объекта не приводят ни к чему
             до кучи
             состояние компонента полностью регулируется formatter объектом
             поэтому он не ререндерится никогда - только при первом вызове
             отсюда любые измения css класса MaskedInput лучше делать через parent селекторы
             */}

            { _.map([
              'Основной телефон',
              'Дополнительный',
              'Дополнительный'
            ], (phone_name, index) =>
              <div key={index} className="m10-0">
                <MaskedInput
                  className='phone-mask'
                  pattern={'+7({{999}}){{999}}-{{99}}-{{99}}'}
                  value={this.state.phones.get(index)}
                  onChange={_.bind(this.on_phone_change, null, index)}/>

                <span className="va-M fs12 mL10">{phone_name}</span>
              </div>)
            }

            <hr className="hr m15-0"/>

            <table className='w100pr'>
              <tr>
                <td>Дни</td>
                <td>Время работы</td>
              </tr>

              { _.map([
                'пон. - пят.',
                'суббота',
                'воскресенье'
              ], (day, index) =>
                <WorkDaysBlock
                  key={index}
                  onHolidayChange={_.bind(this.on_holiday_change, null, index)}
                  onFromChange={_.bind(this.on_from_change, null, index)}
                  onToChange={_.bind(this.on_to_change, null, index)}
                  title={day}
                  is_holiday={this.state.work_time.get(index).get('is_holiday')}
                  from={this.state.work_time.get(index).get('from')}
                  to={this.state.work_time.get(index).get('to')}
                  className="mn-t-10px txt-al-middle"/>)
              }
            </table>
          </div>
          <div className="w400px">
            <GoogleAutocomplete formattedAddress={this.state.address} onAddressChange={this.onAddressChange} onCenterChange={this.onCenterChange}
                                className="mT10" companyType={this.state.type} center={center}/>

          </div>
        </div>
        <div className="m20-0">
          <button onClick={this.submit_form} disabled={!this.state.address || !(this.state.phones.get(0).length > 10)}
                  className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20">Сохранить
          </button>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = FilialAddressSelector;
