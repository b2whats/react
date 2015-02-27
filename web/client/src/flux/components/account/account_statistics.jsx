'use strict';

//var _ = require('underscore');
var React = require('react/addons');
//var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var event_names = require('shared_constants/event_names.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DragableElement = require('components/controls/dragable_element.jsx');
var ChartControlsSlider = require('components/controls/charts/chart_controls_slider.jsx');
var Chart = require('components/controls/charts/chart.jsx');

/* jshint ignore:end */


var immutable = require('immutable');

var kPLOT_DX = 150;//style_utils.from_px_to_number( sass_vars['footer-panel-width'] );
var kPLOT_HEIGHT = 200;    //;style_utils.from_px_to_number( sass_vars['footer-svg-plot-height'] );
var kPLOT_MARGIN_TB = 10;

var plots_data = immutable.fromJS([
  {
    id: 1,
    class_name: "my-line-classname",
    data:[0.1, 0.5, 0.9, 0.9, 0.5, 0.9]
  },

  {
    id: 2,
    class_name: "my-line2-classname",
    data:[0.5, 0.9, 0.9, 0.5, 0.9, 0.1]
  },
]);


var AccountStatistics = React.createClass({

  mixins: [PureRenderMixin],


  render () {


    /* jshint ignore:start */
    return (
      <div className="account-statistics">
        <h3 className="hint hint--top hint--info hint-html"><span>графики</span><div className="hint-content"><h3>html hint</h3>привет мир</div></h3>
        <Chart className="chart-main-chart" plots_data={plots_data} plot_dx={kPLOT_DX} margin_top_bottom={kPLOT_MARGIN_TB} />
        
        <div className="chart-control-holder">
          <Chart className="chart-control-holder-chart" plots_data={plots_data} plot_dx={kPLOT_DX} margin_top_bottom={0} />
          <ChartControlsSlider />
        </div>
      </div>
    );
    /* jshint ignore:end */  
  }
});

module.exports = AccountStatistics;
