'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = require('classnames');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var PriceListSelector = require('components/test/price_list_selector.jsx');

var price_list_selector_actions = require('actions/admin/price_list_selector_actions.js');
var price_list_selector_store = require('stores/admin/price_list_selector_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  price_list_values: price_list_selector_store.get_values (),
  first_value: price_list_selector_store.get_first_value(),
  range_to: price_list_selector_store.get_price_range_to(),
  range_from: price_list_selector_store.get_price_range_from()
}),
price_list_selector_store /*observable store list*/);


var PriceListSelectionBlock = React.createClass({

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_price_list_selector_change(index, val) {
    price_list_selector_actions.update_position(index, val);
  },

  on_price_list_selector_add(val) {
    price_list_selector_actions.add_position(val);
  },

  on_price_list_selector_price_change(index, price_from) {    
    price_list_selector_actions.update_position_by_price(index, +price_from.target.value);
  },

  on_price_list_selector_delta_fix_change(index, delta_fix) {
    //console.log(index, delta_fix);
    price_list_selector_actions.update_delta_fix(index, +delta_fix.target.value);
  },

  on_price_list_selector_delta_percent_change(index, delta_percent) {
    price_list_selector_actions.update_delta_percent(index, +delta_percent.target.value);
  },

  reverse(val) {
    var val = (val | 0) + '';
    return val.split("").reverse().join("").replace(/([0-9]{1,3})/g, '$1 ').trim().split("").reverse().join("");
  },
  render() {
    var values = this.state.price_list_values
      .map((v, index) => v.set('index', index))
      .push(this.state.first_value.set('percent', -1).set('index', -1))      
      .sortBy(v => v.get('percent'));


    var TrPriceListRows =  _.map(_.range(0, values.size), index => {
      var from = (index===0) ? 0 : values.get(index).get('price_from');
      var to = (index===values.size - 1) ? 'inf' : values.get(index+1).get('price_from');
      var delta_fix = values.get(index).get('delta_fix');
      var delta_percent = values.get(index).get('delta_percent');
      var curr_index = values.get(index).get('index');
      var to_index = (index===values.size - 1) ? -1 : values.get(index+1).get('index');

      return (
        <tr key={to_index}>
          <td className={cx('ta-c p20-0 bR1s bc-grey-300 w30px', {'bgc-grey-50' : index%2 == 0})}>{index + 1} <span className='slider-table-marker'></span></td>
          <td  className={cx('ta-c w250px', {'bgc-grey-50' : index%2 == 0})}>
            <span className='d-ib mR10 ta-r w90px va-m'>
              {this.reverse(from)} руб.
            </span>
            <span>-</span>
            { to === 'inf' ? 
              <span className='fs22 mR10 va-m w100px ta-c d-ib'  dangerouslySetInnerHTML={{__html: '&#8734;'}}></span> :
              <span><input
                type="number"
                value={Math.round(to)}
                onChange={_.bind(this.on_price_list_selector_price_change, null, to_index)}
                className='mL10 w80px d-ib br2 b1s bc-grey-300 p2-5'/>
              <span> руб.</span></span>
            }
          </td>
          <td  className={cx('ta-c w250px', (index%2 == 0)? 'bgc-grey-200' : 'bgc-grey-50')}>
            <input 
              value={delta_fix}
              onChange = {_.bind(this.on_price_list_selector_delta_fix_change, null, curr_index)} 
              type="search"
              className='w50px d-ib br2 b1s bc-grey-300 p2-5'/>
            <span> руб.</span>
            <span style={{marginLeft:'5px', marginRight: '15px'}}>+</span>
            <input 
              value={delta_percent} 
              onChange = {_.bind(this.on_price_list_selector_delta_percent_change, null, curr_index)}
              type="search"
              className='w30px d-ib br2 b1s bc-grey-300 p2-5'/>
            <span> %</span>
          </td>
        </tr>

      );
    });




    return (
      <div>
        <PriceListSelector 
          value={this.state.price_list_values.toJS()} 
          from={this.state.range_from} 
          to={this.state.range_to} 
          onChange={this.on_price_list_selector_change} 
          onAdd={this.on_price_list_selector_add}/>

        <div>
          <div className='d-ib va-t'>
            <span className='w30px p5-0 pB10 ta-c d-ib'>№</span>
            <span className='w250px p5-0 pB10 ta-c d-ib'>Диапазон</span>
            <span className='w250px p5-0 pB10 ta-c d-ib'>Наценка</span>
            <table cellSpacing="0" className="slider-table va-T br7 o-h b1s bc-grey-300 tl-f bcol-s">
              <tbody>
                  {TrPriceListRows}
              </tbody>
            </table>
          </div>
          <div className="va-T br6 d-ib m25 w40pr z-depth-1 p20-15">
            <h3>Инструкция</h3>
            <br/>
            добавить - двойной клик,
            <br/>
            убрать - утянуть ползунок вправо или назначить цену больше максимальной
          </div>
        </div>
        {/*
          <div style={{marginTop: '30px'}}>
            <button onClick={() => console.log(price_list_selector_store.get_result().toJS())}>вывести результат в консоль</button>
          </div>
        */}
      </div>
    );
  }
});

module.exports = PriceListSelectionBlock;
