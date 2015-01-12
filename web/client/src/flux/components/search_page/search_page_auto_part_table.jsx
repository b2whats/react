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
  //auto_part_markers: auto_part_by_id_store.get_auto_part_markers(),
  auto_part_results: auto_part_by_id_store.get_auto_part_results()
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

  on_hover(id, hover_state) {
    auto_part_by_id_actions.auto_part_marker_hover(id, hover_state, {update_same_address: false});
  },

  on_hover_out() {
  },

  

  render () {
    /* jshint ignore:start */
    //is_hovered
    
    var TrMarkers  = this.state.auto_part_results && this.state.auto_part_results.map(part => {
      
      var hover_class = cx({
        hovered_same_rank: part.get('is_hovered_same_rank'), //это значит кто то в табличке или на карте навелся на ранк X
        hovered_same_address: part.get('is_hovered_same_address')
      });

      return (
        <tr key={part.get('id')}>
          <td onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
              onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)} 
              onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autopart-table-td-rank', hover_class) }>
            <span className="search-page-autopart-table-rank">{part.get('rank')}</span>
          </td>

          <td onMouseEnter={_.bind(this.on_hover, this, part.get('main_marker').get('id'), true)}
              onMouseLeave={_.bind(this.on_hover, this, part.get('main_marker').get('id'), false)}
              onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autopart-table-td-seller', hover_class)}>

            <div className="search-page-autopart-table-company-name">{part.get('main_marker').get('company_name')}</div>
            <div className="search-page-autopart-table-company-address">{part.get('main_marker').get('address')}</div>
          </td>

          <td className="search-page-autopart-table-td-manufacturer-code">
            <div className="search-page-autopart-table-manufacturer">{part.get('manufacturer')}</div> 
            <div className="search-page-autopart-table-code">{part.get('code')}</div> 
          </td>

          <td>{/*m.get('balloon_visible').toString()*/}</td>
        </tr>
        )
      }
    ).toJS();
    
    
    return (
      <div className={this.props.className}>
        <div className="search-page-table-border">
          <table cellSpacing="0" className="pure-table pure-table-striped search-page-autopart-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Продавец</th>
                      <th>Производитель / Артикул</th>
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
