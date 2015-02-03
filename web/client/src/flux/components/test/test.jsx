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
  work_time: filial_address_and_work_time_store.get_work_time(),
  type: filial_address_and_work_time_store.get_type(),
  phone: filial_address_and_work_time_store.get_phone()

}),
region_store, filial_address_and_work_time_store /*observable store list*/);


var TestPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_phone_change(e) {    
    filial_address_and_work_time_actions.f_phone_change(e.target.value);
  },

  on_address_changed(address, coords) {
    filial_address_and_work_time_actions.f_address_change(address); 
    filial_address_and_work_time_actions.f_coords_change(coords); 
  },

  on_type_changed(type) {
    filial_address_and_work_time_actions.f_type_change(type);
  },

  render () {
    var map_width = 400; //важно знать заранее как вариант подтянуть из sass
    var map_height = 300; //важно знать заранее как вариант подтянуть из sass
    //var address = 'Москва, Россошанская ул. д.4';

    var bounds = [[59.744465,30.042834],[60.090935,30.568322]]; //определить например питером на случай если region_current не прогрузился
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }

    console.log('this.state.address, this.state.coordinates, this.state.phone', 
                 this.state.address, this.state.coordinates && this.state.coordinates.toJS(), this.state.phone);
    

    var marker_color = kMARKER_COLOR[this.state.type - 1];

    return (
      <div className="select-filial-modal width600px">
        <div className="txt-al-center">
          <button 
            onClick={_.bind(this.on_type_changed, this, 1)}
            className={cx(cx({active: this.state.type===1}) ,'btn-with-icon pd-5px mn-5px mn-b-15px mn-r-0')}>
            <i className="svg-icon_gear btn-svg-icon"></i> 
            <span>Автозапчасти</span>
          </button>

          <button 
            onClick={_.bind(this.on_type_changed, this, 2)}
            className={cx(cx({active: this.state.type===2}) , 'btn-with-icon pd-5px mn-5px mn-b-15px mn-l-0')}>
            <i className="svg-icon_key-gear btn-svg-icon"></i>              
            <span>Автосервисы</span>
          </button>
        </div>

        <div style={ {display: 'inline-block', width: '200px', verticalAlign: 'top', paddingRight: '10px'} }>
          
          {/*надо помнить что MaskedInput отличается от обычного input react тем что оно имеет односторонний бинд
            а именно только при инициализации привязывается к value и дальнейшие изменения value объекта не приводят ни к чему
            до кучи 
            состояние компонента полностью регулируется formatter объектом
            поэтому он не ререндерится никогда - только при первом вызове  
            отсюда любые измения css класса MaskedInput лучше делать через parent селекторы
            */}
          <MaskedInput 
            style={{'letterSpacing':'1px', width: '100%'}} 
            pattern={'+{{9}}({{999}}){{999}}-{{99}}-{{99}}'}
            value={this.state.phone}           
            onChange={this.on_phone_change} />

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
      
      </div>
    );
  }
});

module.exports = TestPage;
