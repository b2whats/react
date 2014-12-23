'use strict';

var React = require('react/addons');
var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var _ = require('underscore');
var immutable = require('immutable');
/* jshint ignore:start */
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
//var Table = require('react-bootstrap').Table;
var Input = require('react-bootstrap').Input;

/* jshint ignore:end */

var recommender_store = require('stores/recommender_store.js');
var work_view_store = require('stores/work_view_store.js');

var work_view_actions =require('actions/work_view_actions.js');

var css_chared = require('sass/common_vars.json');

//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //лямбда для update this.state
  bins: recommender_store.query_bins(),
  id_2_checked: work_view_store.get_id_2_checked ()
}),
recommender_store, work_view_store /*если компоненте надо несколько store то перечисляем их тут через запятую*/);


var WorkView = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  get_checkbox_change(index, id) {
    return function(e) {
      //console.log(index, id, e.target.checked);
      work_view_actions.work_view_feature_changed(id, e.target.checked);
    };
  },

  render () {

    var all_rules = this.state.bins.map(bin => //вытащить все правила - и проставить им bin_id для скорости
      bin.get('rules')
        .map(rule => 
          rule.set('bin_id', bin.get('id'))))
    .flatten(1)
    .map(rule => immutable.Map({
        id: rule.get('feature').get('id') + '#-+#+-#' + (rule.get('value') && rule.get('value').get('id') || ''),
        title: rule.get('feature').get('title'),
        sub_title: rule.get('value') && rule.get('value').get('title'), //rule value if exists 
        weight: rule.get('weight'),
        bin_id: rule.get('bin_id')
    }))
    .groupBy(rule => rule.get('id'))
    .map((rules, key) => immutable.Map(
        { id: key,
          title:rules.getIn([0, 'title']),
          sub_title:rules.getIn([0, 'sub_title']),
          rules: rules}))
    .toList(); //отгруппировать одинаковые 
    
    //console.log('all_rules.toJS()',all_rules.toJS());

    var rules = all_rules.map((rule, index) => 
      <Input  key={index}
              onChange={this.get_checkbox_change(index, rule.get('id'))} 
              labelClassName="ice-label" 
              wrapperClassName="ice-checkbox" 
              type="checkbox"
              checked={this.state.id_2_checked.get(rule.get('id'))} 
              label={rule.get('title') + (rule.get('sub_title') ? (' ('+rule.get('sub_title')+')') : '' ) } />).toJS();

    //all_rules
    var checked_rules = all_rules.filter(rule => this.state.id_2_checked.get(rule.get('id')));


    //бежим по корзинам, находим все рули с весами - увеличиваем вес
    var weights = this.state.bins.map(bin => 
      checked_rules.reduce((memo, rule) => 
        memo + 
          rule.get('rules')
            .filter(r => r.get('bin_id')===bin.get('id'))
            .reduce((m, r) => m + 1*r.get('weight'), 0) , 1*bin.get('weight')));
    
    var max_weight = weights.max();// weights
    var num_colors = 1 * css_chared['plot-shared-vars']['num-colors'];

    var bins_plot =  this.state.bins.map((bin, index) => (
      <div key={index} className={cx('bin-plot-line', 'bin-plot-color-'+ (index % num_colors) )} style={ {width: ''+ (100*weights.get(index)/max_weight) + '%' } } >
        <div className="label">
          {bin.get('title')}
        </div>
      </div>)).toJS();



    /* jshint ignore:start */
    return (
      <Row>
        <Col xs={12}>
            <hr/>
            <br/>
            <h4>Bin histogram</h4>
        </Col>
      
        <Col xs={12}>          
          {bins_plot}
        </Col>

        <Col xs={12} md={10} mdOffset={1}>
          <form className="form-inline" role="form">
          {rules}
          </form>          
        </Col>

        <Col xs={12}>
        <br/><br/><br/><br/>
        выбирайте фильтры и критерии и смотрите как будут меняться рекомендации пользователям
        <br/><br/><br/>
        </Col>
      </Row>
    )
    /* jshint ignore:end */
  }
});

module.exports = WorkView;






















