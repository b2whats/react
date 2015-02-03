'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var MaskedInput = require('components/forms_element/masked_input.jsx');
var YandexMapAddressSelect = require('components/yandex/yandex_map_address_select.jsx');
/* jshint ignore:end */

var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  region_current:           region_store.get_region_current (), 
}),
region_store /*observable store list*/);


var TestPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_change(e) {
    console.log('phone value', e.target.value);
  },

  on_address_changed(address, coords) {
    console.log('on_address_changed(address, coords)', address, coords);
  },

  render () {
    var width = 400; //важно знать заранее как вариант подтянуть из sass
    var height = 300; //важно знать заранее как вариант подтянуть из sass
    var address = 'Москва, Россошанская ул. д.4';

    var bounds = [[59.744465,30.042834],[60.090935,30.568322]]; //определить например питером на случай если region_current не прогрузился
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }

    return (
      <div>
        <h1>пример поля для телефона</h1>
        {/*надо помнить что MaskedInput отличается от обычного input react тем что оно имеет односторонний бинд
          а именно только при инициализации привязывается к value и дальнейшие изменения value объекта не приводят ни к чему
          до кучи 
          состояние компонента полностью регулируется formatter объектом
          поэтому он не ререндерится никогда - только при первом вызове  
          отсюда любые измения css класса MaskedInput лучше делать через parent селекторы
          */}
        <MaskedInput 
          style={{'letterSpacing':'1px'}} 
          pattern={'+{{9}}({{999}}){{999}}-{{99}}-{{99}}'}
          value={'7(926)'}           
          onChange={this.on_change} />

        <hr/> 
        <h1>пример выбора адреса</h1>
        <YandexMapAddressSelect
          onChange={this.on_address_changed}
          coordinates = {[55.592203901644, 37.61599634924302]}
          icon_color={'#ee3399'} //нужно менять взависимости от выбора меню
          search={address}
          bounds={bounds}
          width={width} //важно знать заранее
          height={height} //важно знать заранее
          style={ {width:`${width}px`, height: `${height}px`} }/>

      </div>
    );
  }
});

module.exports = TestPage;
