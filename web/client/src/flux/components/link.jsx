'use strict';

var _ = require('underscore');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var route_template = require('utils/route_template.js');

var route_actions = require('actions/route_actions.js');

var routes_store = require('stores/routes_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  route_context_params: routes_store.get_route_context_params ()
}),
routes_store /*observable store list*/);


var route_templates_cache_ = {};

var Link = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],


  get_evaluated_link (link, default_params) {

    if(this.state.route_context_params && link!==undefined && typeof link === 'string') {
      if(!(link in route_templates_cache_)) {
        route_templates_cache_[link] = route_template(link);
      }
      var link_template = route_templates_cache_[link];
      //console.log(default_params, this.state.route_context_params.toJS());
      var evaluated_link = link_template(_.extend({},default_params, this.state.route_context_params.toJS()));

      return evaluated_link;
    }
    return link;
  },

  on_click (event) {
    var link = this.get_evaluated_link(this.props.href, this.props.params || {});
    route_actions.goto_link(link);
    event.preventDefault();
    event.stopPropagation();
  },

  render () {
    var { href, ...other_props } = this.props;
    var link = this.get_evaluated_link(href, this.props.params || {});
    /* jshint ignore:start */
    return (
      <a onClick={this.on_click} title={this.props.children} href={link} {...other_props}>{this.props.children}</a>
    )
    /* jshint ignore:end */
  }
});

module.exports = Link;
