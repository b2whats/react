'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var region_actions = require('actions/region_actions.js');
var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  region_list: region_store.get_region_list (),
  region_current: region_store.get_region_current ()
}),
region_store /*observable store list*/);


var RegionSelector = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  on_region_click (e) {
    
  },
  typeahead_changed (e) {

  },

  render () {
    var region_name = this.state.region_current && this.state.region_current.get('title');

    //show_value={this.state.suggestion_show_value.toJS()}         

    return (
        <div className="header-region">
          <img src="images/templates/icon-map.png" alt="" />
          <div className="stylized-select select-dotted">
            <span 
              className="stylized-select__select-text"
              onClick={this.on_region_click}>{region_name}</span>
            
            <div style={{display:'block'}} className="region_selector stylized-select__dropdown">
              <Typeahead              
                placeholder="Выберите регион ..." 
                has_custom_scroll={true} 
                onChange={this.typeahead_changed} 
                options={this.state.region_list && this.state.region_list.toJS()} />
            </div>
          </div>
        </div>
    );
  }
});



module.exports = RegionSelector;
