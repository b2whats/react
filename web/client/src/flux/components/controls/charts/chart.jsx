'use strict';

//var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var UniqueNameMixin = require('components/mixins/unique_name_mixin.jsx');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var event_names = require('shared_constants/event_names.js');
var raf = require('utils/raf.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DragableElement = require('components/controls/dragable_element.jsx');
var ChartControlsSlider = require('components/controls/charts/chart_controls_slider.jsx');
var SvgPlot = require('components/controls/charts/svg_plot/svg_plot.jsx');
/* jshint ignore:end */


var immutable = require('immutable');


var Chart = React.createClass({

  mixins: [PureRenderMixin, UniqueNameMixin],

  propTypes: {
    plot_dx: PropTypes.number.isRequired,
    margin_top_bottom: PropTypes.number,
  },

  getInitialState() {
    return {
      plot_height: -1,
      plot_hover_id: null

    };
  },

  componentDidMount() {
    setTimeout(()=> {
      this.setState({plot_height: this.refs.svg_plot_holder.getDOMNode().offsetHeight});
    } , 1);
  },

  componentWillMount() {
    var self = this;

    this.mouse_x = -10000;
    this.mouse_y = -10000;

    this.mouse_move_dispatcher = merge(Emitter.prototype, {
      get_mouse_position() {
        return [self.mouse_x, self.mouse_y];
      }
    });
  },

  //для графика надо
  x_index_2_position(index) {
    return this.props.plot_dx/2.0 + this.props.plot_dx*index;
  },
  
  x_position_2_index(x_pos) {
    var base = (x_pos - this.props.plot_dx/2.0)/this.props.plot_dx;
    return Math.floor(base);
  },


  //передать снаружи
  y_index_value_2_position(index, value, id) {
    var scale = this.state.plot_height - 2*(this.props.margin_top_bottom === undefined ? 0 : this.props.margin_top_bottom);    
    var v = value;
    return (this.props.margin_top_bottom === undefined ? 0 : this.props.margin_top_bottom) + scale * ( 1 - v);
  },

  on_mouse_move(e) {    
    var cx = e.clientX;
    var cy = e.clientY;

    var m = this.refs.svg_plot.getDOMNode().getScreenCTM();

    var inv  = m.inverse();
    var svg_mouse_x = inv.a*cx + inv.c*cy + inv.e;
    var svg_mouse_y = inv.b*cx + inv.d*cy + inv.f;
    if(svg_mouse_y <= this.state.plot_height && svg_mouse_y>=0) {
      this.mouse_x = svg_mouse_x;
      this.mouse_y = svg_mouse_y;
    } else {
      this.mouse_x = -10000;
      this.mouse_y = -10000;
    }
    this.mouse_move_dispatcher.fire(event_names.kON_CHANGE);
  },

  on_mouse_leave() {
    this.mouse_x = -10000;
    this.mouse_y = -10000;
    this.mouse_move_dispatcher.fire(event_names.kON_CHANGE);
  },

  on_plot_hover_distance(id, distance, x, y) {
    var index = this.x_position_2_index(x);
    var kUNHOVER_DISTANCE = 30;

    if(distance<kUNHOVER_DISTANCE && this.state.plot_hover_id!==id) {
      raf(() => {
        var state = {plot_hover_id: id};
        if(this.isMounted()) {
          this.setState(state);
        }
      }, null, this.getUniqueName());  
    } else if(this.state.plot_hover_id!==null && distance>kUNHOVER_DISTANCE) {
      raf(() => {
        var state = {plot_hover_id: null};
        if(this.isMounted()) {
          this.setState(state);
        }
      }, null, this.getUniqueName());  
    }
  },  

  render () {
    var plots_data = this.props.plots_data;

    if(this.state.plot_hover_id!==null) {
      plots_data = plots_data.map(pd => pd.get('id') === this.state.plot_hover_id ? pd.set('hover', true) : pd);
    }

    /* jshint ignore:start */
    return (
      <div ref="svg_plot_holder" className={this.props.className} onMouseLeave={this.on_mouse_leave} onMouseMove={this.on_mouse_move}>
        {this.state.plot_height > 0 &&
          <SvgPlot
            ref="svg_plot"
            on_plot_hover_distance={this.on_plot_hover_distance}

            x_index_2_position={this.x_index_2_position}
            x_position_2_index={this.x_position_2_index}
            y_index_value_2_position={this.y_index_value_2_position}

            mouse_move_dispatcher={this.mouse_move_dispatcher}
            data={plots_data}

            has_hover={true}
            has_classname={true}       

            refresh={this.state.plot_height} 
            className="svg-plot" />
          }
      </div>
    );
    /* jshint ignore:end */  
  }
});

module.exports = Chart;
