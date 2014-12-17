'use strict';

var React = require('react/addons');
var _ = require('underscore');

var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');
var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Button = require('react-bootstrap').Button;//можно так require('react-bootstrap').Button
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Table = require('react-bootstrap').Table;
var Input = require('react-bootstrap').Input;

var ReactAutocomplete = require('react-autocomplete');

var Bin = require('./bin.jsx');
var WorkView = require('./work_view.jsx');
/* jshint ignore:end */

var recommender_actions = require('actions/recommender_actions.js');

var recommender_store = require('stores/recommender_store.js');
var routes_store = require('stores/routes_store.js');





//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //лямбда для update this.state
  bins: recommender_store.query_bins(),
  feature_filters_list: recommender_store.query_features(),
  default_bin: recommender_store.default_bin(),
  has_changed: recommender_store.has_changed()
}),
recommender_store /*если компоненте надо несколько store то перечисляем их тут через запятую*/);

var Recommender = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  on_save_click() {
    //console.log('routes_store.get_route_context_params()', routes_store.get_route_context_params().toJS());
    recommender_actions.recommender_save(routes_store.get_route_context_params().toJS(), this.state.bins.toJS());
  },

  render () {
    var kBINS_PER_ROW = 3;
    var kEMPTY_BIN = 1;

    var feature_list = this.state.feature_filters_list.toJS();

    var bin_rows = _.map(_.range(Math.floor( (this.state.bins.size + kEMPTY_BIN - 1) / kBINS_PER_ROW ) + 1), () => []);
    bin_rows = this.state.bins.reduce((memo, bin, bin_index) => memo[Math.floor(bin_index/kBINS_PER_ROW)].push(bin) && memo,  bin_rows);

    //всегда в конец добавляем пустую корзинку
    bin_rows[Math.floor(this.state.bins.size / kBINS_PER_ROW)].push(this.state.default_bin);
    
    bin_rows = _.map(bin_rows, (row_bins, row_index) => (
      <Row key={row_index} className="bin-row">
        {_.map(row_bins, (bin, bin_index) => (
          <Bin key={bin_index} bin={bin} feature_list={this.state.feature_filters_list} />
        ))}
      </Row>
    ));

    /* jshint ignore:start */
    return (
        <div>
          {bin_rows}
  
          <Row>
            <Col xs={12}>
              <Button onClick={this.on_save_click} disabled={!this.state.has_changed} bsStyle={this.state.has_changed ? "danger" : "success"} bsSize="large">SAVE</Button>
            </Col>
          </Row>
        
          <WorkView/>
        </div>
    )
    /* jshint ignore:end */
  }
});

module.exports = Recommender;






