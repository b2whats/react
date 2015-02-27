'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var kTEXT_INFO_STYLE = {color: 'green', marginTop: '10px'};

/**
 * Пример шаблона для маркера графика
 */
var ChartMarkerTemplateDefault = React.createClass({

  mixins: [PureRenderMixin],
  render () {
    return (
      <div className="hint hint--top hint--info hint-html svg-plot-marker">
        <div className="svg-plot-marker-hint-emitter"></div>
        <div className="hint-content">
          <h3>{this.props.current_info.get('date')}</h3>
          <div>
            clicks:
              {this.props.current_info.get('clicks')}  
          </div>
          <div>
            information:
              {this.props.current_info.get('information')}
          </div>
          
          <div style={kTEXT_INFO_STYLE}>
            вобщем пишем тут чо хотим и тащим инфу какую хотим, для каждой точки передаются index, info, current_info из plot_data
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ChartMarkerTemplateDefault;
