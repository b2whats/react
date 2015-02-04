'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var PriceListSelector = require('components/test/price_list_selector.jsx');

var price_list_selector_actions = require('actions/admin/price_list_selector_actions.js');
var price_list_selector_store = require('stores/admin/price_list_selector_store.js');

var immutable = require('immutable');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  price_list_values: price_list_selector_store.get_values (),
  first_value: price_list_selector_store.get_first_value(),
  range_to: price_list_selector_store.get_price_range_to(),
  range_from: price_list_selector_store.get_price_range_from()
}),
price_list_selector_store /*observable store list*/);


console.error('Этот код для примера потом удалить');
price_list_selector_actions.initialize([
    {delta_fix: 200, delta_percent: 1}, //значение без price_from это значение наценки для первого интервала цены
    {price_from: 30000, delta_fix: 200, delta_percent: 1 },
    {price_from: 10000, delta_fix: 200, delta_percent: 1 }, //сортировка пофигу
    {price_from: 40000, delta_fix: 100, delta_percent: 1 },
    {price_from: 50000, delta_fix: 200, delta_percent: 1 },
    ], 0, 73000);

var Test2 = React.createClass({

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_price_list_selector_change(index, val) {
    price_list_selector_actions.update_position(index, val);
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

  one_way_binding_change(index, val) {
    //console.log(index, val);
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
          <td>{index}</td>
          <td>
            <span style={{marginRight: '10px', textAlign: 'right', width: '70px', height: '22px', display: 'inline-block'}}>
              {Math.round(from)} руб.
            </span>
            <span>-</span>
            { to === 'inf' ? 
              <span style={{marginLeft: '10px', width: '70px', height: '22px', display: 'inline-block'}}>доупора</span> :
              <input 
                type="number"
                value={Math.round(to)}
                onChange={_.bind(this.on_price_list_selector_price_change, null, to_index)}
                style={{marginLeft: '10px', width: '70px', height: '22px', display: 'inline-block'}}/>
            }
          </td>
          <td>
            <input 
              value={delta_fix}
              onChange = {_.bind(this.on_price_list_selector_delta_fix_change, null, curr_index)} 
              type="number" 
              style={{marginRight: '5px', width: '70px', height: '22px', display: 'inline-block'}}/>
            <span>руб.</span>
            <span style={{marginLeft:'5px', marginRight: '15px'}}>+</span>
            <input 
              value={delta_percent} 
              onChange = {_.bind(this.on_price_list_selector_delta_percent_change, null, curr_index)}
              type="number" 
              style={{marginRight: '5px', width: '70px', height: '22px', display: 'inline-block'}}/>
            <span>%</span>
          </td>
        </tr>

      );
    });




    return (
      <div>
        <h3 className="noselect">test</h3>
        <PriceListSelector 
          value={this.state.price_list_values.toJS()} 
          from={this.state.range_from} 
          to={this.state.range_to} 
          onChange={this.on_price_list_selector_change} />
        
        <div style={ {marginTop: '20px'} } className="wrap gutter-15-xs">
          <div className="md-12-6">
            <table style={ {fontSize: '13px', width: '100%', tableLayout: 'fixed'} } cellSpacing="0" className="pure-table pure-table-striped">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>N</th>
                  <th>Диапазон</th>
                  <th>Наценка</th>
                </tr>
              </thead>
              <tbody>
                {TrPriceListRows}

              </tbody>


            </table>
            

          

          </div>
          <div className="md-12-6"></div>
        </div>
        <div style={{marginTop: '30px'}}>
        <button onClick={() => console.log(price_list_selector_store.get_result().toJS())}>вывести результат в консоль</button>
        </div>



        


      </div>
    );
  }
});

module.exports = Test2;
