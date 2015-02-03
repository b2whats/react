'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

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

var sass_vars = require('sass/common_vars.json')['yandex-map'];
var kMARKER_COLOR = [sass_vars['auto-part-marker-color'], sass_vars['autoservice-marker-color']];


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  region_current:           region_store.get_region_current (),

  address: filial_address_and_work_time_store.get_address(),
  coordinates: filial_address_and_work_time_store.get_coordinates(),
  metadata: filial_address_and_work_time_store.get_metadata(),

  work_time: filial_address_and_work_time_store.get_work_time(),
  type: filial_address_and_work_time_store.get_type(),
  phones: filial_address_and_work_time_store.get_phones()

}),
region_store, filial_address_and_work_time_store /*observable store list*/);


var FilialAddressSelector = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_phone_change(index, e) {
    filial_address_and_work_time_actions.f_phone_change(index, e.target.value);
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
  
  on_to_change(index, value) {
    filial_address_and_work_time_actions.f_work_time_to_change(index, value);
  },

  render () {
    var map_width = 400; //важно знать заранее как вариант подтянуть из sass
    var map_height = 300; //важно знать заранее как вариант подтянуть из sass
    //var address = 'Москва, Россошанская ул. д.4';

    var bounds = [[59.744465,30.042834],[60.090935,30.568322]]; //определить например питером на случай если region_current не прогрузился
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }

    //console.log('this.state.address, this.state.coordinates, this.state.phone', 
    //             this.state.address, this.state.coordinates && this.state.coordinates.toJS(), this.state.phones.toJS());        
    //console.log('metadata', this.state.metadata && this.state.metadata.toJS());

    var marker_color = kMARKER_COLOR[this.state.type - 1];

    /* jshint ignore:start */
    return (
      <div className="select-filial-modal width600px">
        <div className="txt-al-center mn-b-15px">
          <ButtonGroup select_element_value={this.state.type} onChange={this.on_type_changed}>
            <button className="btn-bg-group w160px" value={1}><i className='svg-icon_gear mr5 va-m fs16'/>Автозапчасти</button>
            <button className="btn-bg-group w160px" value={2}><i className='svg-icon_key mr5 va-m fs16'/>Сервис</button>
          </ButtonGroup>
        </div>

        <div style={ {display: 'inline-block', width: '330px', verticalAlign: 'top', paddingRight: '10px'} }>
          
          {/*надо помнить что MaskedInput отличается от обычного input react тем что оно имеет односторонний бинд
            а именно только при инициализации привязывается к value и дальнейшие изменения value объекта не приводят ни к чему
            до кучи 
            состояние компонента полностью регулируется formatter объектом
            поэтому он не ререндерится никогда - только при первом вызове  
            отсюда любые измения css класса MaskedInput лучше делать через parent селекторы
            */}

         { _.map(['Основной телефон', 'Дополнительный', 'Дополнительный' ], (phone_name, index) => 
            <div key={index} className="mn-t-10px txt-al-middle ">
              <MaskedInput 
                style={{'letterSpacing':'1px', width: '50%'}} 
                pattern={'+{{9}}({{999}}){{999}}-{{99}}-{{99}}'}
                value={this.state.phones.get(index)}
                onChange={_.bind(this.on_phone_change, null, index)} />

              <div className="width50p displ-ib pt-2px pl-10px">{phone_name}</div>
            </div>)
          }

          <hr className="mn-b-15px mn-t-30px"/>

          <div className="mn-t-10px">
            <div className="width50p displ-ib">
            Дни
            </div>
            <div className="width50p displ-ib pl-10px">
            Время работы
            </div>
          </div>

          { _.map(['пон. - пят.', 'суббота', 'воскресенье' ], (day, index) => 
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
        </div>



        <div style={ {display: 'inline-block', width: `${map_width}px`} }>          
          <YandexMapAddressSelect
            onChange={this.on_address_changed}
            coordinates = {this.state.coordinates && this.state.coordinates.toJS()}
            icon_color={marker_color} //нужно менять взависимости от выбора меню
            search={this.state.address}
            bounds={bounds}
            width={map_width} //важно знать заранее
            height={map_height} //важно знать заранее
            style={ {width:`${map_width}px`, height: `${map_height}px`} }/>
        </div>      
      
        <div className="txt-al-center mn-b-15px">
          выберите адрес и телефон и нажмите
          <button disabled={!this.state.address || !(this.state.phones.get(0).length > 10)} className="pd-10px mn-t-15px mn-l-15px">Сохранить</button>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = FilialAddressSelector;
