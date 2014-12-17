'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var _ = require('underscore');

/* jshint ignore:start */
//var Row = require('react-bootstrap').Row;
//var Col = require('react-bootstrap').Col;
//var Table = require('react-bootstrap').Table;
var Input = require('react-bootstrap').Input;

var ReactAutocomplete = require('react-autocomplete');
/* jshint ignore:end */

var bin_actions = require('actions/bin_actions');

var BinFeatureItem = React.createClass({
  mixins: [PureRenderMixin],

  on_feature_changed (evt) {
    var v = _.extend({}, evt);
    delete v.values;

    bin_actions.feature_changed(this.props.bin_id, this.props.index, v);
  },

  on_weight_changed (evt) {
    bin_actions.feature_weight_changed(this.props.bin_id, this.props.index, evt.target.value);
  },

  render () {

    var feature_list = this.props.feature_list.toJS();

    var disabled = this.props.feature.get('feature').get('id') === undefined;
    /* jshint ignore:start */
    return (
      <tr>
        <td>
          <ReactAutocomplete 
            options={feature_list} 
            value={ this.props.feature.get('feature').toJS() } 
            onChange={this.on_feature_changed}/>
        </td>
        <td>
          <Input
            groupClassName="input-group input-group-sm" 
            onChange={this.on_weight_changed}
            placeholder="0"
            type="number"
            disabled={disabled}
            value={this.props.feature.get('weight')} />
        </td>
      </tr>
    )
    /* jshint ignore:end */
  }
});

module.exports = BinFeatureItem;
