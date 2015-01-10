'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  auto_part_markers: auto_part_by_id_store.get_auto_part_markers()
}),
auto_part_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');


var SearchPageAutoPartTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  on_marker_click(id) {
    auto_part_by_id_actions.close_all_and_open_balloon(id);
  },

  render () {
    /* jshint ignore:start */
    
    var TrMarkers  = this.state.auto_part_markers && this.state.auto_part_markers.map(m => (
      <tr key={m.get('id')}>
        <td>
          {m.get('company_name')}
        </td>
        <td>
          <button onClick={_.bind(this.on_marker_click, this, m.get('id'))}>{m.get('address')}</button>
        </td>
        <td>
          {m.get('is_open').toString()}
        </td>
        <td></td>
      </tr>)
    ).toJS();
    
    
    return (
      <div className={this.props.className}>
        <div className="search-page-table-border">
          <table cellSpacing="0" className="pure-table pure-table-striped search-page-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Make</th>
                      <th>Model</th>
                      <th>Year</th>
                  </tr>
              </thead>

              <tbody>
                {TrMarkers}
              </tbody>
          </table>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = SearchPageAutoPartTable;
