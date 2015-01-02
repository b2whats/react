'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var AutoPartsSearchWrapper = require('components/search_wrappers/auto_part_search_wrapper.jsx');
var AutoServiceSearchWrapper = require('components/search_wrappers/autoservice_search_wrapper.jsx');
/* jshint ignore:end */

var search_page_actions = require('actions/search_page_actions.js');

var auto_part_search_actions = require('actions/auto_part_search_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');

var search_page_store = require('stores/search_page_store.js');
var region_store = require('stores/region_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  width: search_page_store.get_search_page_width (),
}),
search_page_store /*observable store list*/);

var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['default-page'];
var sass_input_padding = style_utils.from_px_to_number( sass_vars['input-padding'] );

var kLIST_DELTA=9; //сумма толщин бордеров - потом посчитаю и хз откуда 1 пиксель



var SearchPage = React.createClass({
  mixins: [PureRenderMixin , RafBatchStateUpdateMixin],

  fire_change() {      
    if(this.refs && this.refs.default_page_content) {
      var node = this.refs.default_page_content.getDOMNode();     
      search_page_actions.search_page_size_chaged (node.clientWidth - 2*sass_input_padding - kLIST_DELTA);
    }  
  },

  handle_resize() {
    this.fire_change();
  },

  componentDidMount() {
    window.addEventListener('resize', this.handle_resize);
    this.fire_change();
    setTimeout(() => this.fire_change(), 0); //layout render
  },

  componentWillUnmount() {    
    window.removeEventListener('resize', this.handle_resize);
  },

  render() {
    /* jshint ignore:start */
    return (<h1>Поиск</h1>);
    /* jshint ignore:end */    
  }
});

module.exports = SearchPage;

