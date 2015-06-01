'use strict';

//var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx = require('classnames');

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
    /**
    * immutable array of data points
    * вида
    * ```
    * [
    *   {
    *     id: 2,
    *     class_name: "my-line2-classname",
    *     data:[0.5, 0.9, 0.9, 0.5, 0.9, 0.1, 0.5, 0.9, 0.9, 0.5, 0.9, 0.1],    
    *     info:[
    *       {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
    *       {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
    *       {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
    *       {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
    *       {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
    *       {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'},
    *       {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
    *       {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
    *       {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
    *       {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
    *       {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
    *       {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'}      
    *     ]
    *   }
    * ]
    * ```
    */
    plots_data: PropTypes.object,

    /**
    * ширина шага графика
    */
    plot_dx: PropTypes.number.isRequired,

    plot_dx_offset: PropTypes.number.isRequired,
    
    /**
    * отступы графиков от верха низа
    */
    margin_top_bottom: PropTypes.number,
    
    /**
    * marker_template шаблон кружочка - маркера при наведении на который надо что то показывать
    */
    marker_template: PropTypes.func,

    /**
    * curvature скругленность чем больше тем острее углы
    */
    curvature: PropTypes.number    
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
    return this.props.plot_dx_offset + this.props.plot_dx/2.0 + this.props.plot_dx*index;
  },
  
  x_position_2_index(x_pos) {
    var base = (x_pos - this.props.plot_dx/2.0 - this.props.plot_dx_offset)/this.props.plot_dx;
    return Math.floor(base);
  },


  //передать снаружи
  y_index_value_2_position(index, value, id) {
    var scale = this.state.plot_height - 2*(this.props.margin_top_bottom === undefined ? 0 : this.props.margin_top_bottom);    
    var v = value;
    return (this.props.margin_top_bottom === undefined ? 0 : this.props.margin_top_bottom) + scale * ( 1 - v);
  },

  on_mouse_move(e) {
    if(!this.isMounted()) return;
    if(this.refs.svg_plot===undefined) return;
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



    var Markers = this.props.marker_template && plots_data
      .map(pd => {
        var positions = pd.get('data').map( (v, index) => {
          var x = this.x_index_2_position(index);
          var y = this.y_index_value_2_position(index, v, pd.get('id'));
          return immutable.Map({x: x, y:y});
        });

        return pd.set('positions', positions);
      })
      .map(pd => 
        pd.get('positions')
          .map((pos, index) => 
            <div 
              key={pd.get('id') + '_' + index}

              className={cx('svg-plot-marker-holder', index >= this.props.index_from && index<=this.props.index_to ? '-visible':'-hidden')}
              style={{position: 'absolute', left: `${pos.get('x')}px`, top: `${pos.get('y')}px` }}>              
              {React.createElement(this.props.marker_template, 
                {
                  id: pd.get('id'),
                  index: index,
                  description: pd.get('description'),
                  info: pd.get('info'), 
                  current_info: pd.get('info').get(index),
                  className: pd.get('class_name'),
                  visible: index >= this.props.index_from && index<=this.props.index_to
                })}
            </div>)
      )
      .flatten()
      .toJS();
      

    /* jshint ignore:start */
    return (
      <div ref="svg_plot_holder" className={cx(this.props.className, 'svg-plot-holder')} onMouseLeave={this.on_mouse_leave} onMouseMove={this.on_mouse_move}>
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

            curvature={this.props.curvature}

            refresh={this.state.plot_height} 

            plot_dx={this.props.plot_dx}
            from = {this.props.from}
            to  =  {this.props.to}

            className="svg-plot" />
          }

          {this.state.plot_height > 0 &&
            <div className="svg-plot-markers-panel">
              {Markers}
            </div>
          }
      
      </div>
    );
    /* jshint ignore:end */  
  }
});

module.exports = Chart;
