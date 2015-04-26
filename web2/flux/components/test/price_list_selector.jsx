'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = require('classnames');

var PureRenderMixin = React.addons.PureRenderMixin;

var DragableElement = require('components/controls/dragable_element.jsx');

var indexed_bind = require('utils/indexed_bind.js')

var PriceListSelector = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
  
  },

  getInitialState() {
    return {
      value: this.props.value || this.props.defaultValue || [{percent:10}, {percent:20}, {percent:70}]
    };
  },

  componentWillMount() {
    this.bind_memoize = indexed_bind.create_indexed_bind();
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

  on_double_click(e) {
    var pos = (e.clientX - e.currentTarget.offsetLeft) / e.currentTarget.getBoundingClientRect().width;
    pos = Math.min(Math.max(pos, 0), 0.999);

    if(this.props.onAdd) {
      this.props.onAdd(100*pos);
    }
  },
  reverse(val) {
    var val = (val | 0) + '';
    return val.split("").reverse().join("").replace(/([0-9]{1,3})/g, '$1 ').trim().split("").reverse().join("");
  },
  render () {
    var values = this.props.value!==undefined ? this.props.value : this.state.value;
    values = _.map(values, (v, index) => ({index: index, data: v}));
    values = _.sortBy(values, v => v.data.percent);

    return (
      <div className="price-slider">

        <div onDoubleClick={this.on_double_click} className="ml-40px mr-40px pos-rel slider-border">
          <div className="-background-line pos-abs noselect"></div>

          { _.map(values,
            (v, sorted_index) => (
              <DragableElement key={v.index} className='drag-slider' onChange={this.bind_memoize(this.on_dragable_change, v.index)} value={v.data.percent} sorted_index_very_pure_mixin={sorted_index}>
                {/*отрисовка полозка*/}
                <div className="-thumb noselect cur-pointer">
                  {/*текст над ползунком*/}
                  <div className="-thumb-up-text">{sorted_index + 1}</div>
                  {/*сам ползунок*/}
                  <div className="-thumb-down nowrap h-15px">
                    <span className="-thumb-down-thumb w-10px h-15px inl-block"></span>
                    {/*текст справа от ползунка*/}
                    <span className="-thumb-down-text h-15px pl-5px inl-block">
                    {this.reverse(v.data.price_from)}</span>
                  </div>
                </div>

              </DragableElement>
              ))
          }
          <div className="-from-title pos-abs noselect">{this.props.from}</div>
          <div className="-to-title pos-abs noselect" dangerouslySetInnerHTML={{__html: '&#8734;'}}></div>
        </div>
      </div>
    );
  }
});

module.exports = PriceListSelector;

