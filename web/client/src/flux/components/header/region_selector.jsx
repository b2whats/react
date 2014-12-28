'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var region_actions = require('actions/region_actions.js');
var route_actions = require('actions/route_actions.js');

var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  region_list:              region_store.get_region_list (),
  region_current:           region_store.get_region_current (),
  region_selection_visible: region_store.get_region_selection_visible(),
  show_value_hack:          region_store.get_region_selection_show_value()
}),
region_store /*observable store list*/);


var RegionSelector = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  on_region_click (e) {
    region_actions.change_region_selection_visibility(!this.state.region_selection_visible);
  },
  
  typeahead_changed (v) {
    if(v.id!==this.state.region_current.get('id')) {
      route_actions.goto_link('/'+v.id);
    } else {
      region_actions.change_region_selection_visibility(false);
    }
  },

  typeahead_lost_focus () { //означает что тайпахед закрылся
    region_actions.change_region_selection_visibility(false);
  },

  render () {
    var region_name = this.state.region_current && this.state.region_current.get('title');

    var style = {
      display: this.state.region_selection_visible ? 'block' : 'none'
    };
    
    return (
        <div className="header-region">
          <img src="images/templates/icon-map.png" alt="" />
          <div className="stylized-select select-dotted">
            <span 
              className="stylized-select__select-text"
              onClick={this.on_region_click}>{region_name}</span>
            
            <div style={style} className="region_selector stylized-select__dropdown">
              <Typeahead
                show_value={this.state.show_value_hack.toJS()}
                placeholder="Выберите регион ..." 
                has_custom_scroll={true} 
                onChange={this.typeahead_changed} 
                on_blur={this.typeahead_lost_focus}
                options={this.state.region_list && this.state.region_list.toJS()} />
            </div>
          </div>
        </div>
    );
  }
});



module.exports = RegionSelector;
