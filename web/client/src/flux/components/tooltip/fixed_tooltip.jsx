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

var dom_helper = require('utils/dom_helper.js');




var FixedTooltip = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  on_close_tootip(e) {
    fixed_tooltip_actions.show_fixed_tooltip(-1, '');
    
    if(e) {  
      e.preventDefault();
      e.stopPropagation();
    }
  
  },

  componentWillMount() {
    this.subscribed = false;  
  },

  componentWillUnmount() {
    if(this.subscribed) {
      var body = dom_helper.query_selector('body');
      dom_helper.unsubscribe(body, 'click', this.on_body_click);        
      this.subscribed = false;
    }      
  },

  on_body_click (e) {
    if(this.refs.tooltip_node) {
      var target = e.target;
      var current = this.refs.tooltip_node.getDOMNode();
      while(target!==null && target!==current) {
        target = target.parentNode;
      }

      if(target!==current) {
        this.on_close_tootip();        
      }
    }
  },

  componentWillUpdate(next_props, next_state) {
    if(next_props.open_id === next_state.open_id && next_props.open_type === next_state.open_type) {      
      if(!this.subscribed) {
        var body = dom_helper.query_selector('body');
        dom_helper.subscribe_w_capture(body, 'click', this.on_body_click);
        this.subscribed = true;
      }  
    } else {
      if(this.subscribed) {
        var body = dom_helper.query_selector('body');
        dom_helper.unsubscribe(body, 'click', this.on_body_click);        
        this.subscribed = false;
      }      
    }
  },

  render () {
    var class_name = cx('fixed-tooltip-content');

    if(this.props.open_id === this.state.open_id && this.props.open_type === this.state.open_type) {
      return (
        <span ref="tooltip_node" className={cx(this.props.className, class_name)}>
          <div>
          {this.props.children}
          </div>
          <div onClick={this.on_close_tootip} className="fixed-tooltip-content-close btn-close">
          </div>

        </span>
        );
    } else {
     return null;
    }
  }
});

module.exports = FixedTooltip;
