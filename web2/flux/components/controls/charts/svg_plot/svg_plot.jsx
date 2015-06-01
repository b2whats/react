'use strict';
var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var cx = require('classnames');


var raf = require('utils/raf.js');
var event_names = require('shared_constants/event_names.js');

var Bezier = require('utils/math/bezier.js');
var easing = require('utils/easing.js');
//var Bezier = function(x0, y0, x1, y1, x2, y2, x3, y3)
//solveYValueFromXValue

/* jshint ignore:start */
var SvgPlotPathLine = require('./svg_plot_path_line.jsx');
/* jshint ignore:end */
var Path = require('paths-js/path');

var component_idx_ = 0;

var kCURVATURE = 3;

var SvgPlot = React.createClass({
  mixins: [PureRenderMixin],
  
  propTypes: {
    data: PropTypes.object.isRequired,
    mouse_move_dispatcher: PropTypes.object,

    on_plot_hover_distance:PropTypes.func,
    
    x_index_2_position: PropTypes.func.isRequired,
    x_position_2_index: PropTypes.func.isRequired,
    y_index_value_2_position: PropTypes.func.isRequired,

    curvature: PropTypes.number,
  },

  componentWillMount() {
    
    this.__internal__dname__ = '__' + this.constructor.displayName + '__' + component_idx_;
    ++component_idx_;
    if(this.props.mouse_move_dispatcher) {
      this.event_disabler = this.props.mouse_move_dispatcher.on(event_names.kON_CHANGE, this.on_change_handler);
    }
  },
  
  componentWillUnmount() {
    if(this.props.mouse_move_dispatcher) {
      this.event_disabler();
    }
    delete this.event_disabler;
  },

  on_change_handler () {
    var mouse_pos = this.props.mouse_move_dispatcher.get_mouse_position();
    if(this.isMounted()){
      raf(() => this.on_mouse_move.apply(this, mouse_pos), null,  this.__internal__dname__);
    }
  },
  
  on_mouse_move(x,y) {
    //найти ближайший график  
    var self = this;
    var distances = this.props.data.map( d =>
      ({id:d.get('id'), distance: self.get_distance_2_curve(x, y, d.get('data'), d.get('id'))}));

    if(distances.size > 0) {
      var min_dist = distances.minBy(d => d.distance);
    
      if(this.props.on_plot_hover_distance) {
        this.props.on_plot_hover_distance(min_dist.id, min_dist.distance, x, y);
      }
    }
  },

  //передать снаружи
  x_index_2_position(index) {
    return this.props.x_index_2_position(index);
  },
  
  x_position_2_index(x_pos) {
    return this.props.x_position_2_index(x_pos);
  },

  //передать снаружи
  y_index_value_2_position(index, value, id) {
    return this.props.y_index_value_2_position(index, value, id);
  },

  get_distance_2_curve(m_x, m_y, data, id) {
    var curvature = this.props.curvature || kCURVATURE;

    var index = this.x_position_2_index(m_x);
    if(index < 0) {
      var y_val = this.y_index_value_2_position(0, data.get(0), id );
      return Math.abs(y_val - m_y);
    }

    if(index >= data.size-1) {
      var y_val = this.y_index_value_2_position(data.size-1, data.get(data.size-1), id );
      return Math.abs(y_val - m_y); 
    }
    
    var start_x = this.x_index_2_position(index);
    var start_y = this.y_index_value_2_position(index, data.get(index), id);
    
    var end_x = this.x_index_2_position(index+1);
    var end_y = this.y_index_value_2_position(index+1, data.get(index+1), id);
    
    var curve_x0 = start_x + (end_x - start_x)/curvature;
    var curve_x1 = end_x - (end_x - start_x)/curvature;

    var b = new Bezier(start_x,start_y, curve_x0, start_y, curve_x1, end_y, end_x, end_y);
    
    var d = b.solveYValueFromXValue(m_x);

    return Math.abs(d - m_y);
  },

  data_2_d (data, id) {
    var curvature = this.props.curvature || kCURVATURE;
    //var b = new Bezier(0,0, 70,0, 140,50, 200,50);
    //console.log('b.solveYValueFromXValue',b.solveYValueFromXValue(190));
    var start_x = this.x_index_2_position(0);
    var start_y = this.y_index_value_2_position(0, data.get(0), id);

    var res = data.rest().reduce((memo, y_val, index) => {
      index = index + 1;

      var end_x = this.x_index_2_position(index);
      var end_y = this.y_index_value_2_position(index, y_val, id);
      var curve_x0 = memo.prev_x + (end_x - memo.prev_x)/curvature;
      var curve_x1 = end_x - (end_x - memo.prev_x)/curvature;

      //memo.path = memo.path.lineto(end_x, end_y);
      memo.path = memo.path.curveto(curve_x0, memo.prev_y, curve_x1, end_y, end_x, end_y);
      memo.prev_x = end_x;
      memo.prev_y = end_y;

      return memo;
    }, {path: Path().moveto(0, start_y).lineto(start_x, start_y), prev_x:start_x, prev_y: start_y});

    
    return res.path
      .lineto(res.prev_x + this.x_index_2_position(data.size), res.prev_y)
      .print();
  },

  render () {
    var Pathes = this.props.data.map( (d,i) =>
      <SvgPlotPathLine 
        key={i}
        data={d.get('data')}
        hover={this.props.has_hover && d.get('hover')}
        className={this.props.has_classname && d.get('class_name')}
        id={d.get('id')}
        refresh={this.props.refresh}

        plot_dx={this.props.plot_dx}
        from={this.props.from}
        to={this.props.to}

        data_2_d={this.data_2_d} />).toJS();

    return (
      <svg version="1.1" className={this.props.className}>
        {Pathes}
      </svg>
    );
  }
});

module.exports = SvgPlot;
