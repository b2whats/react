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
      values: [{percent:10}, {percent:20}, {percent:70}]
    };
  },

  on_dragable_change(index, value) {    
    this.state.values[index].percent = value;
    this.replaceState({values: this.state.values});
  },

  render () {
    var values = _.map(this.state.values, (v, index) => ({index: index, data: v}));
    values = _.sortBy(values, v => v.data.percent);

    return (
      <div style={ {marginLeft: '40px', marginRight: '40px'} }>
        <div style={ {position: 'relative'} }>
          { _.map(values, 
            (v, sorted_index) => (
              <DragableElement key={v.index} onChange={_.bind(this.on_dragable_change, null, v.index)} value={v.data.percent}>
                <div className="noselect" style={ {cursor: 'pointer'} }>
                  <div style={ {width:'10px', textAlign: 'center'} }>{sorted_index}</div>
                  <div>
                    <span style={ {height: '15px', width:'10px', display:'inline-block', backgroundColor:'red'} }></span>
                    <span style={ {height: '15px', display:'inline-block', paddingLeft:'5px'} }>{Math.round(v.data.percent)}</span>
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

