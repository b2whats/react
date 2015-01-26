'use strict';

var React = require('react/addons');

var routes = require('../routes.js');
var route_names = require('shared_constants/route_names.js');
var routes_store = require('stores/routes_store.js');

var RouterMixin = require('mixins/router_mixin.js')(routes);
var rafBatchStateUpdateMixinCreate =require('./mixins/raf_state_update.js');
var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Header = require('components/header/header.jsx');
var Footer = require('components/footer.jsx');
var DefaultPage = require('components/default/default_page.jsx');
var SearchPage = require('components/search_page/search_page.jsx');

var Link = require('components/link.jsx');
/* jshint ignore:end */


//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
	router_state: routes_store.get_route_state_ro()
}),
routes_store /*observable store list*/);

//var TypeaheadPage = require('./typeahead/typeahead_page.jsx');



var ice_main = React.createClass({
	mixins: [PureRenderMixin, RouterMixin, RafBatchStateUpdateMixin],

	on_feature_changed: function(v) {
		console.log('on_feature_changed', v);
	},

	render () {

		var main = (function(router_state) { 
			switch(router_state) {
				case route_names.kROUTE_DEF:
				case route_names.kROUTE_DEF_W_REGION:
					/* jshint ignore:start */
					return (
						<DefaultPage />
					);
					/* jshint ignore:end */
				break;
				case route_names.kROUTE_PARTS_FIND:
					return (
						<SearchPage />
					);
				break;

				case route_names.kROUTE_CATALOG:
					return (
						<SearchPage route_names={route_names.kROUTE_CATALOG} />
					);
				break;

			}
		}) (this.state.router_state);

		return (
			<div className="main-wrapper">
				<Header />	
				<div className="hfm-wrapper main-body">					
					{main}
				</div>
				<Footer />
			</div>
	  );
	}
});

module.exports = ice_main;
