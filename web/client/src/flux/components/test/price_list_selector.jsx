'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;

var DragableElement = require('./dragable_element.jsx');


var PriceListSelector = React.createClass({
  //mixins: [PureRenderMixin],

  propTypes: {
  
  },

  getInitialState() {
    return {
      value: this.props.value || this.props.defaultValue || [{percent:10}, {percent:20}, {percent:70}]
    };
  },

  on_dragable_change(index, value) {
    if(this.props.value !== undefined) {
      if(this.props.onChange === undefined) {
        console.error('you must define onChange prop if value defined');
      }
      this.props.onChange(index, value);
    } else {
      this.state.value[index].percent = value;
      this.replaceState({value: this.state.value});
      if(this.props.onChange) {
        this.props.onChange(index, value);
      }
    }
  },

  render () {
    var values = this.props.value!==undefined ? this.props.value : this.state.value;
    values = _.map(values, (v, index) => ({index: index, data: v}));
    values = _.sortBy(values, v => v.data.percent);

    return (
      <div className="price-slider">

        <div className="ml-40px mr-40px pos-rel h-30px">
          <div className="-background-line pos-abs noselect"></div>
          <div className="-from-title pos-abs noselect">{this.props.from}</div>
          <div className="-to-title pos-abs noselect">{this.props.to}</div>

          { _.map(values, 
            (v, sorted_index) => (
              <DragableElement key={v.index} onChange={_.bind(this.on_dragable_change, null, v.index)} value={v.data.percent}>
                {/*отрисовка полозка*/}  
                <div className="-thumb noselect cur-pointer">
                  {/*текст над ползунком*/}
                  <div className="-thumb-up-text w-10px ta-center">{sorted_index}</div>
                  {/*сам ползунок*/}
                  <div className="-thumb-down nowrap h-15px">
                    <span className="-thumb-down-thumb w-10px h-15px inl-block"></span>
                    {/*текст справа от ползунка*/}
                    <span className="-thumb-down-text h-15px pl-5px inl-block">{Math.round(v.data.price_from || v.data.percent)}</span>
                  </div>
                </div>
              
              </DragableElement>
              ))
          }
        </div>        
      </div>
    );
  }
});

module.exports = PriceListSelector;

