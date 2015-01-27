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

var SearchPageYandexMap = require('components/search_page/search_page_yandex_map.jsx');
var SearchPageAutoPartTable = require('components/search_page/search_page_auto_part_table.jsx');
var SearchPageAutoServiceTable = require('components/search_page/search_page_autoservice_table.jsx');

var CatalogSearch = require('components/catalog_page/catalog_search.jsx');
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

		var MainContent = (function(router_state) {
			switch(router_state) {
				case route_names.kROUTE_DEF:
				case route_names.kROUTE_DEF_W_REGION:
					/* jshint ignore:start */
					return (
						<DefaultPage />
					);
					/* jshint ignore:end */
				break;
				
				//ВСЕ СТРАНИЧКИ У КОТОРЫХ ЕСТЬ ВВЕРХУ ПОИСК
				//ОТЛИЧАЮТСЯ ТОЛЬКО КОНТЕНТОМ
				case route_names.kROUTE_PARTS_FIND:
				case route_names.kROUTE_CATALOG:
				//ВОТ ТУТ МОЖНО МУТИТЬ ПОДРОУТИНГ ДЛЯ ВСЕХ СТРАНИЧЕК С ПОИСКОМ ВВЕРХУ
			    var RightBlockContent = (function(router_state) {
			      switch(router_state) {        
			        case route_names.kROUTE_PARTS_FIND:
			          return (
			            <div className="search-page-right-block">
			              <SearchPageAutoPartTable />
			              <hr className="search-page-hr" />
			              <SearchPageAutoServiceTable />            
			            </div>
			          );
			        break;
			        case route_names.kROUTE_CATALOG:
			          return (
			            <div className="search-page-right-block">
			              <CatalogSearch />
			            </div>
			          );
			        break;
			      }
			    }) (router_state);


					return (
						<SearchPage>
			        {/*-----------ФИКСЕД ЧАСТЬ СТРАНИЧКИ-------------------------------*/}        
			        <div ref='main_content' className="search-page-main-fixed">
			          <SearchPageYandexMap className="search-page-left-block" />
			          {RightBlockContent}
			        </div>
						</SearchPage>
					);
				break;

			}
		}) (this.state.router_state);

		return (
			<div className="main-wrapper">
				<Header />	
				<div className="hfm-wrapper main-body">					
					{MainContent}
				</div>
				<Footer />
			</div>
	  );
	}
});

module.exports = ice_main;
