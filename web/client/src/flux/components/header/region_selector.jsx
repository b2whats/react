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
  region_list:              region_store.get_region_list (),
  region_current:           region_store.get_region_current (),
  region_selection_visible: region_store.get_region_selection_visible(),
  show_value_hack:          region_store.get_region_selection_show_value()
}),
region_store /*observable store list*/);

//странное срабатывание click евента с задержкой 100-200мс после blur 
//если клик вызывает blur то сам event клик почему то отрабатывает с нехилой задержкой после blur
//поэтому после блур клик не обрабатываем - это решает баг с кликаньем по региону
var kCLICK_BLUR_DELAY_MS = 500;

var RegionSelector = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  componentWillMount() {
    this.last_blur_time_ = 0;
  },
  
  on_region_click (e) {
    if((new Date()).getTime() - this.last_blur_time_ > kCLICK_BLUR_DELAY_MS) { //странное срабатывание click евента с задержкой 100-200мс после blur 
      region_actions.change_region_selection_visibility(!this.state.region_selection_visible);
    }
  },

  typeahead_changed (v) {
    if(v.id!==this.state.region_current.get('id')) {
      region_actions.goto_region(v.translit_name);
    } else {
      region_actions.change_region_selection_visibility(false);
    }
  },

  typeahead_lost_focus () { //означает что тайпахед закрылся
    this.last_blur_time_ = (new Date()).getTime();
    region_actions.change_region_selection_visibility(false);
  },


  render () {
    var region_name = this.state.region_current && this.state.region_current.get('title');

    var style = {
      display: this.state.region_selection_visible ? 'block' : 'none'
    };
    console.log('select_region');
    return (
        <div className="header-region">
          <img src="/assets/images/templates/icon-map.png" alt="" />
          <div className="stylized-select select-dotted">
            <span 
              className="stylized-select__select-text"
              onClick={this.on_region_click} >{region_name}</span>
            
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
