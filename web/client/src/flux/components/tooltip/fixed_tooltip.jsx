'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;
var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var fixed_tooltip_store = require('stores/fixed_tooltip_store.js');
var fixed_tooltip_actions = require('actions/fixed_tooltip_actions.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  open_id:   fixed_tooltip_store.get_tooltip_open_id(),
  open_type: fixed_tooltip_store.get_tooltip_open_type()  
}),
fixed_tooltip_store /*observable store list*/);





var FixedTooltip = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_close_tootip() {
    fixed_tooltip_actions.show_fixed_tooltip(-1, '');
  },

  render () {
    var class_name = cx('fixed-tooltip-content');

    if(this.props.open_id === this.state.open_id && this.props.open_type === this.state.open_type) {
      
      return (
        <span className={cx(this.props.className, class_name)}>
          <div>
          {this.props.children}
          </div>
          <div onClick={this.on_close_tootip} className="fixed-tooltip-content-close">
            <div className="svg-icon_close"></div>
          </div>
        </span>);
    } else {
     return null;
    }
  }
});

module.exports = FixedTooltip;
