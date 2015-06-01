'use strict';

//var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var raf = require('utils/raf.js');
var cx = require('classnames');
var UniqueNameMixin = require('components/mixins/unique_name_mixin.jsx');
var PureRenderMixin = React.addons.PureRenderMixin;

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');


/* jshint ignore:start */
var Link = require('components/link.jsx');
var DragableElement = require('components/controls/dragable_element.jsx');
var ChartControlsSlider = require('components/controls/charts/chart_controls_slider.jsx');
var Chart = require('components/controls/charts/chart.jsx');
var ChartMarkerTemplateDefault = require('components/controls/charts/chart_marker_template.jsx');
/* jshint ignore:end */


var immutable = require('immutable');

var kPLOT_DX = 40;//style_utils.from_px_to_number( sass_vars['footer-panel-width'] );

//отступы от верха низа подложки графика грубо pading-top padding-bottom элемента с графиком
var kPLOT_MARGIN_TB = 10;

var ChartWithControl = React.createClass({

  mixins: [PureRenderMixin, UniqueNameMixin],

  propTypes: {
    plots_data: PropTypes.object.isRequired,
    marker_template: PropTypes.func,
    curvature: PropTypes.number
  },

  getInitialState() { //заменить на стору
    return {
      from : this.props.defaultFrom!==undefined ? this.props.defaultFrom : 0,
      to: this.props.defaultTo!==undefined ? this.props.defaultTo : 100
    };
  },

  on_chart_interval_changed(from, to) {
    raf(() => {
      var state = {from: from, to: to};
      this.setState(state);
    }, null, this.getUniqueName());
  },

  handle_resize() {
    this.chart_width = this.refs.chart.getDOMNode().offsetWidth;
    this.forceUpdate();
  },

  componentDidMount() {
    this.chart_width = this.refs.chart.getDOMNode().offsetWidth;
    this.forceUpdate();

    window.addEventListener('resize', this.handle_resize);
  },
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.handle_resize);
  },

  render () {
    var plots_data = this.props.plots_data;
    var dx = kPLOT_DX;
    var dx_bottom_chart = kPLOT_DX;
    var dx_offset = 0;

    //вот тут смотрим что если точек дохера то подсовываем график усредненный по кол-ву точек
    var total_elements = plots_data.get(0).get('data').size;
    var index_from = 0;
    var index_to = total_elements - 1;

    if(this.chart_width) {
      var visible_from = (total_elements-1) * this.state.from/100;
      var visible_to = (total_elements-1) * this.state.to/100;

      var visible_elements = (visible_to - visible_from) + 1;
      dx = this.chart_width / visible_elements;
      dx_offset = -visible_from*dx;
      dx_bottom_chart = this.chart_width / total_elements;

      //индексы данных
      index_from = Math.ceil(visible_from - 0.5);
      index_to =   Math.floor(visible_to + 0.5);
    }
    /* jshint ignore:start */
    return (
      <div className="chart-with-controls">
        
        <div className="entire-width m5-0 c-grey-700">
          <span>От: <strong>{plots_data.get(0).get('info').get(index_from).get('date')}</strong></span>
          <span> До: <strong>{plots_data.get(0).get('info').get(index_to).get('date')}</strong></span>

        </div>
<div>

  <div className="p-r f-L h200px fs12" style={{left: '-35px', width: '30px'}}>
    <div className="p-a fs16 ta-C w200px" style={{left: '-120px', bottom: '100px', transform: 'rotate(-90deg)'}}>{plots_data.get(0).get('description')}</div>
    <span className="p-a" style={{top: '-8px', right: '0px'}}>{plots_data.get(0).get('max')}</span>
    <span className="p-a" style={{top: '47%', right: '0px'}}>{(plots_data.get(0).get('max') + plots_data.get(0).get('min')) / 2 | 0} </span>
    <span className="p-a" style={{bottom: '-8px', right: '0px'}}>{plots_data.get(0).get('min')}</span>
  </div>
  <Chart
    ref="chart"
    className={cx('chart-main-chart', this.chart_width && '-visible' || '-hidden')}
    marker_template={this.props.marker_template || ChartMarkerTemplateDefault}
    plots_data={plots_data}
    plot_dx={dx}
    plot_dx_offset={dx_offset}
    index_from={index_from}
    index_to={index_to}
    curvature={this.props.curvature || 3}
    margin_top_bottom={kPLOT_MARGIN_TB}
  />
</div>

        <div className="chart-control-holder">
          <Chart className="chart-control-holder-chart" plots_data={plots_data} plot_dx={dx_bottom_chart} plot_dx_offset={0} curvature={this.props.curvature || 3} margin_top_bottom={0} />
          <ChartControlsSlider defaultFrom={this.state.from} defaultTo={this.state.to} onChange={this.on_chart_interval_changed} />
        </div>
      </div>
    );
    /* jshint ignore:end */  
  }
});

module.exports = ChartWithControl;
