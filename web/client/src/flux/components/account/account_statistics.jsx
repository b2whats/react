'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DragableElement = require('components/controls/dragable_element.jsx');
var ChartControlsSlider = require('components/controls/charts/chart_controls_slider.jsx');
/* jshint ignore:end */


var AccountStatistics = React.createClass({

  mixins: [PureRenderMixin],
  
  on_dragable_change(num, v) {
    console.log(v);
  },

  render () {
    return (
      <div className="account-statistics">
        <h3>графики</h3>
        <div className="chart">
          <ChartControlsSlider />
        </div>
      </div>
    );
  }
});

module.exports = AccountStatistics;
