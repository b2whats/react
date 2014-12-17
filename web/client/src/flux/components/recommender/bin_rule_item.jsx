'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var _ = require('underscore');

/* jshint ignore:start */
//var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
//var Table = require('react-bootstrap').Table;
var Input = require('react-bootstrap').Input;

var ReactAutocomplete = require('react-autocomplete');
/* jshint ignore:end */

var bin_actions = require('actions/bin_actions');

var kRULE_TYPE_IN = 'in';

var BinRuleItem = React.createClass({
  mixins: [PureRenderMixin],

  on_feature_changed (evt) {
    var v = _.extend({}, evt);
    delete v.values;

    bin_actions.rule_changed(this.props.bin_id, this.props.index, v);
  },

  on_weight_changed (evt) {
    bin_actions.rule_weight_changed(this.props.bin_id, this.props.index, evt.target.value);
  },

  on_rule_value_changed (evt) {
    bin_actions.rule_value_changed(this.props.bin_id, this.props.index, evt);
  },

  render () {
    var feature_list = this.props.feature_list.toJS();

    var disabled = this.props.rule.get('feature').get('id') === undefined;


    var rule_values;

    if(this.props.rule.get('feature').get('type')===kRULE_TYPE_IN) {
      
      var feature_id = this.props.rule.get('feature').get('id');

      var feature_full = this.props.feature_list.find(feature => feature.get('id')===feature_id);

      rule_values = <ReactAutocomplete 
        options={ feature_full.get('values').toJS() } 
        value={ this.props.rule.get('value') && this.props.rule.get('value').toJS() } 
        onChange={this.on_rule_value_changed}/> 
    }

    /* jshint ignore:start */
    return (
      <tr>
        <td>
          
          <Col sm={6}>
            <ReactAutocomplete 
              options={feature_list} 
              value={ this.props.rule.get('feature').toJS() } 
              onChange={this.on_feature_changed}/>
          </Col>
          
          <Col sm={6}>
            {rule_values}          
          </Col>
        
        </td>
        <td>
          <Input
            groupClassName="input-group input-group-sm" 
            onChange={this.on_weight_changed}
            placeholder="0"
            type="number"
            disabled={disabled}
            value={this.props.rule.get('weight')} />
        </td>
      </tr>
    )
    /* jshint ignore:end */
  }
});

module.exports = BinRuleItem;
