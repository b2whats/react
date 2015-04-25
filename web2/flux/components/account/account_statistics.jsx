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

var ChartWithControl = require('components/controls/charts/chart_with_control.jsx');
var ChartMarkerTemplateDefault = require('components/controls/charts/chart_marker_template.jsx');
var tmp_plot_data_ = require('components/test/tmp_plot_data.js');

/* jshint ignore:end */


var immutable = require('immutable');

var AccountStatistics = React.createClass({

  mixins: [PureRenderMixin],


  render () {


    /* jshint ignore:start */
    return (
      <div style={{paddingTop: '30px', paddingLeft: '200px', paddingRight: '200px'}} className="account-statistics">
        <ChartWithControl marker_template={ChartMarkerTemplateDefault} curvature={3} plots_data={tmp_plot_data_}/>
        <br/>
        <br/>
        <ChartWithControl marker_template={ChartMarkerTemplateDefault} curvature={100} plots_data={tmp_plot_data_}/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
      </div>
    );
    /* jshint ignore:end */  
  }
});

module.exports = AccountStatistics;
