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
var SearchBlockHeader = require('components/search_page/search_block_header.jsx');

var Link = require('components/link.jsx');

var SearchPageYandexMap = require('components/search_page/search_page_yandex_map.jsx');
var SearchPageRightBlockContent = require('components/search_page/search_page_right_block_content.jsx');

var CatalogPageRightBlockContent = require('components/catalog_page/catalog_page_right_block_content.jsx');

var FilialAddressSelector = require('components/test/filial_address_selector.jsx');

var PriceListSelector = require('components/test/price_list_selector.jsx');
/* jshint ignore:end */
var Menu = require('components/menu/menu.jsx');

var immutable = require('immutable');
//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
	router_state: routes_store.get_route_state_ro(),
	router_context_params: routes_store.get_route_context_params()
}),
routes_store /*observable store list*/);

//var TypeaheadPage = require('./typeahead/typeahead_page.jsx');

var AccountInfo = require('components/account/info.jsx');




var ice_main = React.createClass({
	mixins: [PureRenderMixin, RouterMixin, RafBatchStateUpdateMixin],

	on_feature_changed: function(v) {
		console.log('on_feature_changed', v);
	},

	render () {

		var MainContent = (function(router_state, router_context_params) {
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
				//ОТЛИЧАЮТСЯ ТОЛЬКО КОНТЕНТОМ Конкретно эти две kROUTE_PARTS_FIND и kROUTE_CATALOG только правым блоком - карта одинаковая
				case route_names.kROUTE_PARTS_FIND:
				case route_names.kROUTE_CATALOG:
				//ВОТ ТУТ МОЖНО МУТИТЬ ПОДРОУТИНГ ДЛЯ ВСЕХ СТРАНИЧЕК С ПОИСКОМ ВВЕРХУ
					var RightBlockContent = (function(router_state) {
					  switch(router_state) {
						case route_names.kROUTE_PARTS_FIND:
						  return <SearchPageRightBlockContent />;
						break;
						case route_names.kROUTE_CATALOG:
						  return <CatalogPageRightBlockContent />;
						break;
					  }
					}) (router_state);


					return (
						<SearchBlockHeader>
							<div ref='main_content' className="search-page-main-fixed">
							  <SearchPageYandexMap className="search-page-left-block" />
							  {RightBlockContent}
							</div>
						</SearchBlockHeader>
					);
				break;

				//ВСЕ СТРАНИЧКИ С ПОИСКОМ НО БЕЗ КАРТЫ
				case route_names.kROUTE_ACCOUNT:
				//У тебя тут возможно будут другие кейсы	и по итогам будет что то вроде как в блоке выше
				//по итогам смотри блок case стал таким же по структуре что и блок выше
				//код стал читаемей
					var menu_list = [
						{name: 'Компания', id:'company'},
						{name: 'Услуги', id:'services'},
						{name: 'Статистика', id:'statistics'},
						{name: 'Управление товарами', id:'manage'},
						{name: 'История оплат', id:'history'}
					];


					var CentralBlockContent = (function(router_state, router_context_params) {
						return (
							<AccountInfo />
						);
					}) (router_state, router_context_params);

					return (
						<SearchBlockHeader>
							<div className='account-container-wrapper'>
								<h1 className='fs29 m5-0'>Личный кабинет</h1>
								<Menu selected={router_context_params.section} className="account-menu" listClassName="ap-link bb-s bold-fixed" items={ menu_list } />
								<hr className='hr100' />
								<div className='account-container'>
									{CentralBlockContent}
								</div>
							</div>
						</SearchBlockHeader>
					);
				break;
				
				case route_names.kROUTE_TEST:
					return (<FilialAddressSelector />);
				break;
				
				case route_names.kROUTE_TEST_N:
					return (<PriceListSelector />);
				break;



			}
		}) (this.state.router_state,this.state.router_context_params.toJS());

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
