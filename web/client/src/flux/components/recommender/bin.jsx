'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var _ = require('underscore');
var immutable = require('immutable');

/* jshint ignore:start */
var Button = require('react-bootstrap/Button');//можно так require('react-bootstrap').Button
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Table = require('react-bootstrap').Table;
var Input = require('react-bootstrap').Input;

var ReactAutocomplete = require('react-autocomplete');

var BinFeatureItem = require('./bin_feature_item.jsx');
var BinRuleItem = require('./bin_rule_item.jsx');
/* jshint ignore:end */

var bin_actions = require('actions/bin_actions');


var Bin = React.createClass({
  mixins: [PureRenderMixin],

  on_bin_title_changed(event) {
    bin_actions.title_changed(this.props.bin.get('id'), event.target.value);
  },

  on_bin_weight_changed(v) {
    bin_actions.weight_changed(this.props.bin.get('id'), event.target.value);
  },

  render () {

    var feature_list = this.props.feature_list.toJS();
    var {bin, ...other_props} = this.props;

    //console.log('other_props', other_props);
    var disabled = bin.get('title')===undefined;
    

    var bin_features = bin.get('features').map((v, index) => 
      <BinFeatureItem {...other_props} bin_id={bin.get('id')} key={index} index={index} feature={v} />).toJS();
    

    var bin_rules = bin.get('rules').map((v, index) => 
      <BinRuleItem {...other_props} bin_id={bin.get('id')} key={index} index={index} rule={v} />).toJS();

    if(!disabled) {
      bin_features.push( <BinFeatureItem {...other_props} bin_id={bin.get('id')} key={bin_features.length} index={bin_features.length} feature={ immutable.fromJS({feature:{}, weight: 1}) } /> );

      bin_rules.push( <BinRuleItem {...other_props} bin_id={bin.get('id')} key={bin_rules.length} index={bin_rules.length} rule={ immutable.fromJS({feature:{}, weight: 1}) } /> );    
    }



    /* jshint ignore:start */
    return (
      <Col xs={12} sm={4}>
        {/*bin header*/}
        <Table striped bordered condensed hover>
          <thead>
            <tr className="tr-header">
              <th className="col-xs-8 col-md-9">
                <Input
                  onChange={this.on_bin_title_changed}
                  label="Bin name"
                  placeholder="Enter name"
                  type="text"
                  value={bin.get('title')}/>
              </th>
              <th className="col-xs-4 col-md-3">
                <Input
                  disabled={disabled}
                  onChange={this.on_bin_weight_changed}
                  label="Weight"
                  placeholder="w"
                  type="number"
                  value={bin.get('weight')}/>
              </th>
            </tr>
          </thead>
          
          
          {/*bin features*/}
          <tbody>            
            {bin_features}
          </tbody>
            


          {/*bin rules*/}
          <tbody>
            <tr className="filter-criteria-hr">
              <td colSpan="2">Rules: Filter or Criteria, value* </td>
            </tr>
            {bin_rules}
          </tbody>




        </Table>
      </Col>

    )
    /* jshint ignore:end */
  }
});

module.exports = Bin;
