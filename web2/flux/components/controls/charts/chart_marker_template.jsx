'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx = require('classnames');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */



/**
 * Пример шаблона для маркера графика
 */
var ChartMarkerTemplateDefault = React.createClass({

  mixins: [PureRenderMixin],
  render () {
    return (
      <div className={cx(this.props.className, 'hint hint--top hint--info hint-html svg-plot-marker')}>
        <div className="svg-plot-marker-hint-emitter"></div>
        <div className="hint-content noevents">
          <h3 className="m0">{this.props.current_info.get('date')}</h3>
          <div className="mT10">
            {this.props.description}:
              {this.props.current_info.get('value')}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ChartMarkerTemplateDefault;
