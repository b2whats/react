'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var raf = require('utils/raf.js');

var UniqueNameMixin = require('components/mixins/unique_name_mixin.jsx');
var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DragableElement = require('components/controls/dragable_element.jsx');
/* jshint ignore:end */

var ChartControlsSlider = React.createClass({

  mixins: [PureRenderMixin, UniqueNameMixin],
  

  propTypes: {
    /**
    * начальное положение левого ползунка контрола
    */
    defaultFrom: PropTypes.number,

    /**
    * начальное положение правого ползунка контрола
    */
    defaultTo: PropTypes.number,

    /**
    * событие при изменении положения
    */
    onChange: PropTypes.func,
  },

  getInitialState() {
    return {
      from: this.props.defaultFrom!==undefined ? +this.props.defaultFrom : 10,
      to: this.props.defaultTo!==undefined ? +this.props.defaultTo : 20,
    };
  },
  
  on_dragable_change(prop, v) {
    raf(() => {
      var state = {};
      state[prop] = v;

      if(this.isMounted()) {
        if(prop === "from" && state.from > this.state.to) {
          state.from = this.state.to;
        }
        
        if(prop === "to" && state.to < this.state.from) {
          state.to = this.state.from;
        }

        if(this.props.onChange) {
          var to = state.to !== undefined ? state.to : this.state.to;
          var from = state.from !== undefined ? state.from : this.state.from;
          
          if(to!==this.state.to || from!==this.state.from) {
            this.props.onChange(from ,  to);
          }
        }

        this.setState(state);
      }
    }, null, this.getUniqueName());
  },

  render () {
    return (
      <div className="chart-controls-slider">
        <div className="chart-controls-slider-line">
          <DragableElement onChange={_.bind(this.on_dragable_change, null, 'from')} value={this.state.from}>
            <div className="chart-controls-slider-left">
              <div className="chart-controls-slider-thumb-line"></div>
              <div className="chart-controls-slider-thumb"></div>
            </div>
          </DragableElement>

          <DragableElement onChange={_.bind(this.on_dragable_change, null, 'to')} value={this.state.to}>
            <div className="chart-controls-slider-right">                  
              <div className="chart-controls-slider-thumb-line"></div>
              <div className="chart-controls-slider-thumb"></div>
            </div>
          </DragableElement>
        </div>
      </div>
    );
  }
});

module.exports = ChartControlsSlider;
