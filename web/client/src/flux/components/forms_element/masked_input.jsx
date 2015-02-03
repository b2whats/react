'use strict';
var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var formatter = require('third_party/formatter.js');

/*надо помнить что MaskedInput отличается от обычного input react тем что оно имеет односторонний бинд
а именно только при инициализации привязывается к value и дальнейшие изменения value объекта не приводят ни к чему
до кучи 
состояние компонента полностью регулируется formatter объектом
поэтому он не ререндерится никогда - только при первом вызове  
отсюда любые измения css класса MaskedInput лучше делать через parent селекторы
*/

var MaskedInput = React.createClass({
  //состояние компонента полностью регулируется formatter объектом
  //поэтому он не ререндерится никогда - только при первом вызове  
  shouldComponentUpdate() {
    return false;
  },

  componentDidMount: function() {
    formatter.get_formatter_promise()
    .then( Formatter => {
      if(this.isMounted()) {
        new Formatter(this.refs.masked_input.getDOMNode(), {
          'pattern': this.props.pattern,
          'persistent': true
        });
      }
    });
  },

  on_change(on_change_ext, e) {
    var target = e.target;
    setTimeout(() => on_change_ext({target: {value: target.value}}), 0);    
  },

  render () {
    var { onChange, value, ...other_props } = this.props;
    var on_change_ext = onChange;

    var re = /\D/ig;
    value = value && value.replace(re, '');

    return (
      <input 
        {...other_props}
        type="text" 
        ref="masked_input" 
        value={value} 
        onChange={this.on_change} //никогда не срабатывает просто убирает ошибку
        onKeyDownCapture={_.bind(this.on_change, this, on_change_ext)} 
        onKeyPressCapture={_.bind(this.on_change, this, on_change_ext)}
        onPasteCapture={_.bind(this.on_change, this, on_change_ext)} />
    );
  }
});

module.exports = MaskedInput;
