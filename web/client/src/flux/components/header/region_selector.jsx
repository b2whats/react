'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
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
  

  render () {
    var region_name = this.state.region_current && this.state.region_current.get('center');


    return (
        <div className="header-region">
          <img src="images/templates/icon-map.png" alt="" />
          <div className="stylized-select select-dotted">
            <span className="stylized-select__select-text">{region_name}</span>
            
            <div style={{display:'None'}} className="stylized-select__dropdown">
              <div className="stylized-select__search">
                <input type="text" placeholder="Поиск..." />
              </div>
              <ul className="stylized-select__list">
                <li>Москва</li>
                <li>Калининград</li>
                <li>Екатеринбург</li>
                <li>Саратов</li>
                <li>Владивосток</li>
              </ul>
            </div>
          </div>
        </div>
    );
  }
});



module.exports = RegionSelector;
