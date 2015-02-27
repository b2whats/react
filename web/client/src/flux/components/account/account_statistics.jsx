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
var ChartMarkerTemplateDefault = require('components/controls/charts/chart_marker_template.jsx');
/* jshint ignore:end */


var immutable = require('immutable');

var kPLOT_DX = 100;//style_utils.from_px_to_number( sass_vars['footer-panel-width'] );
var kPLOT_HEIGHT = 200;    //;style_utils.from_px_to_number( sass_vars['footer-svg-plot-height'] );
var kPLOT_MARGIN_TB = 10;

var plots_data = immutable.fromJS([
  {
    id: 1,
    class_name: "my-line-classname",
    data:[0.1, 0.5, 0.9, 0.9, 0.5, 0.9, 0.1, 0.5, 0.9, 0.9, 0.5, 0.9],
    info:[
      {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
      {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
      {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
      {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'},
      {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
      {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
      {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
      {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'},


    ]
  },

  {
    id: 2,
    class_name: "my-line2-classname",
    data:[0.5, 0.9, 0.9, 0.5, 0.9, 0.1, 0.5, 0.9, 0.9, 0.5, 0.9, 0.1],
    
    info:[
      {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
      {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
      {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
      {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'},
      {date: '2014-11-01', clicks: 1, information: 'bla bla bla 1'}, 
      {date: '2014-11-02', clicks: 3, information: 'bla bla bla 2'}, 
      {date: '2014-11-03', clicks: 6, information: 'bla bla bla 3'}, 
      {date: '2014-11-04', clicks: 3, information: 'bla bla bla 4'}, 
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 5'},
      {date: '2014-11-05', clicks: 4, information: 'bla bla bla 6'}
      
    ]

  },
]);


var AccountStatistics = React.createClass({

  mixins: [PureRenderMixin],


  render () {


    /* jshint ignore:start */
    return (
      <div className="account-statistics">
        <h3 className="hint hint--top hint--info hint-html"><span>графики</span><div className="hint-content"><h3>html hint</h3>привет мир</div></h3>
        <Chart 
          className="chart-main-chart" 
          marker_template={ChartMarkerTemplateDefault}
          plots_data={plots_data}
          plot_dx={kPLOT_DX}
          margin_top_bottom={kPLOT_MARGIN_TB} />
        
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
