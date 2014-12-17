'use strict';

var React = require('react/addons');

var routes = require('../routes.js');
var route_names = require('shared_constants/route_names.js');
var routes_store = require('stores/routes_store.js');

var RouterMixin = require('mixins/router_mixin.js')(routes);
var rafBatchStateUpdateMixinCreate =require('./mixins/raf_state_update.js');
var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;

var Link = require('./link.jsx');
/* jshint ignore:end */


//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
	router_state: routes_store.get_route_state_ro()
}),
routes_store /*observable store list*/);

var Recommender = require('./recommender/recommender.jsx');


var ice_main = React.createClass({
	mixins: [PureRenderMixin, RouterMixin, RafBatchStateUpdateMixin],

	on_feature_changed: function(v) {
		console.log('on_feature_changed', v);
	},

	render () {

		var main = (function(router_state) { 
			switch(router_state) {
				case route_names.kDEFAULT_ROUTE:
					/* jshint ignore:start */
					return (
						<Row>
	        		<Col xs={12}>
	        			<h3>Ссылки</h3>
								<Link href="/sphere/1">Туризм</Link><br/>
								

							</Col>
						</Row>
					);
					/* jshint ignore:end */
				break;

				case route_names.kHELP_ROUTE:
					/* jshint ignore:start */
					return (
						<Row>
	        		<Col xs={12}>
	        			<iframe className="help-iframe" src="/docs/index.html"/>
	        		</Col>
	        	</Row>
	        );

					/* jshint ignore:end */
				break;

				case route_names.kSPHERE_ROUTE:
					/* jshint ignore:start */
					return <Recommender />
					/* jshint ignore:end */
				break;
			}
		}) (this.state.router_state);

		return (
	    <Grid className="recommandation">
	      <Row className="header">
	        <Col xs={4}>
	        	<Link href="/">
	          	<div className="header-text">
	            	Recommendation admin interface
	          	</div>
	        	</Link>
	        </Col>
	        <Col xs={4}>
	        </Col>
	        <Col className="align-right" xs={4}>
	        	<Link className='help-link' href="/help">help</Link>
	        </Col>
	      </Row>

	      {main}
	    
	    </Grid>
	  );
	}
});

module.exports = ice_main;
