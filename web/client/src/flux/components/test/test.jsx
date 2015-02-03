'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var MaskedInput = require('components/forms_element/masked_input.jsx');
/* jshint ignore:end */

var TestPage = React.createClass({
  mixins: [PureRenderMixin],

  on_change(e) {
    console.log('phone value', e.target.value);
  },

  render () {

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
      </div>
    );
  }
});

module.exports = TestPage;
