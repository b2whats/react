const React = require('react/addons');


const routeNames = require('shared_constants/route_names.js');
const routesStore = require('stores/routes_store.js');


const rafBatchStateUpdateMixinCreate = require('./mixins/raf_state_update.js');
const PureRenderMixin = React.addons.PureRenderMixin;

const Header = require('components/header/header.jsx');
const Footer = require('components/footer.jsx');
const DefaultPage = require('components/default/default_page.jsx');

const Agreement = require('components/static/agreement.jsx');
const SearchBlockHeader = require('components/search_page/search_block_header.jsx');

const Link = require('components/link.jsx');

const SearchPageYandexMap = require('components/search_page/search_page_yandex_map.jsx');
const SearchPageRightBlockContent = require('components/search_page/search_page_right_block_content.jsx');

const CatalogPageRightBlockContent = require('components/catalog_page/catalog_page_right_block_content.jsx');
//потому что ES6 модуль
//const {CatalogPageRightBlockContentNew}= require('components/catalog_page_new/catalog_page_right_block_content_new.jsx');
import CatalogPageRightBlockContentNew from 'components/catalog_page_new/catalog_page_right_block_content_new.jsx';

const GoogleMapBlockExample = require('components/google/google_map_block_example.jsx');

const PriceListSelectionBlock = require('components/test/price_list_selection_block.jsx');

const AccountInfo = require('components/account/info.jsx');
const CompanyInfo = require('components/company/company.jsx');
const AccountServices = require('components/account/services.jsx');
const AccountManage = require('components/account/account_manage.jsx');
const AccountManageHistory = require('components/account/account_manage_history.jsx');
const AccountStatistics = require('components/account/account_statistics.jsx');

import AfterRegister from 'components/after_register.jsx';

const Menu = require('components/menu/menu.jsx');

const authStore = require('stores/auth_store.js');
const immutable = require('immutable');


//State update and stores for which we need intercept kON_CHANGE events
const RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
	router_state: routesStore.get_route_state_ro(),
	router_context_params: routesStore.get_route_context_params(),
  check_done: authStore.get_check_done()
}),
routesStore, authStore /*observable store list*/);

//const TypeaheadPage = require('./typeahead/typeahead_page.jsx');


//const auth_actions = require('actions/auth_actions.js');
//auth_actions.check_auth();
const cx = require('classnames');
const IceMain = React.createClass({
	mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

	render() {
    let MainContent = ((router_state, router_context_params) => {
      console.log(router_state, router_context_params);
			switch(router_state) {
				case routeNames.kROUTE_R_A:
				case routeNames.kROUTE_R_B:
				case routeNames.kROUTE_R_C:
					return (
						<div>
							<Link href={routeNames.kROUTE_R_A}>{routeNames.kROUTE_R_A}</Link><br/>
							<Link href={routeNames.kROUTE_R_B}>{routeNames.kROUTE_R_B}</Link><br/>
							<Link href={routeNames.kROUTE_R_C}>{routeNames.kROUTE_R_C}</Link><br/>
						</div>
					);

				break;


        case routeNames.kROUTE_AGREEMENT:

          return (
            <SearchBlockHeader>
              <div className='account-container-wrapper'>
                <div className='account-container'>
                  <Agreement />
                </div>
              </div>
            </SearchBlockHeader>
          );
          break;
				case routeNames.kROUTE_DEF:
				case routeNames.kROUTE_DEF_W_REGION:
        case routeNames.kROUTE_ADV:
					/* jshint ignore:start */
					return (
						<DefaultPage route_context={router_context_params}/>
					);
					/* jshint ignore:end */
				break;
				//ВСЕ СТРАНИЧКИ У КОТОРЫХ ЕСТЬ ВВЕРХУ ПОИСК
				//ОТЛИЧАЮТСЯ ТОЛЬКО КОНТЕНТОМ Конкретно эти две kROUTE_PARTS_FIND и kROUTE_CATALOG только правым блоком - карта одинаковая
				case routeNames.kROUTE_PARTS_FIND:
				case routeNames.kROUTE_CATALOG:
				//ВОТ ТУТ МОЖНО МУТИТЬ ПОДРОУТИНГ ДЛЯ ВСЕХ СТРАНИЧЕК С ПОИСКОМ ВВЕРХУ
					const RightBlockContent = (function(router_state) {
	    		switch(router_state) {
						case routeNames.kROUTE_PARTS_FIND:
						  return <SearchPageRightBlockContent />;
						break;
						case routeNames.kROUTE_CATALOG:
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

        case routeNames.kROUTE_CATALOG_NEW:
          return (
            <SearchBlockHeader>
              <div ref='main_content' className="search-page-main-fixed search-page-main-fixed--new">
                <GoogleMapBlockExample style={{backgroundColor: 'blue'}} className="search-page-left-block search-page-left-block--new" />
                <CatalogPageRightBlockContentNew />
              </div>
            </SearchBlockHeader>
          );
        break;

				//ВСЕ СТРАНИЧКИ С ПОИСКОМ НО БЕЗ КАРТЫ
				case routeNames.kROUTE_ACCOUNT:
				//У тебя тут возможно будут другие кейсы	и по итогам будет что то вроде как в блоке выше
				//по итогам смотри блок case стал таким же по структуре что и блок выше
				//код стал читаемей
					const menu_list = [
						{name: 'Компания', id:'company'},
						{name: 'Услуги', id:'services'},
						//{name: 'Статистика', id:'statistics'},
						{name: 'Управление товарами', id:'manage'},
						//{name: 'История оплат', id:'history'}
					];


					const CentralBlockContent = (function(router_state, router_context_params) {
            console.log(router_context_params);
            switch(router_context_params.section) {
              case 'company':
                return <AccountInfo />;
                break;
              case 'services':
                return <AccountServices />;
                break;
              case 'manage':
              	return <AccountManage />;
              break;
              case 'manage-history':
                return <AccountManageHistory />;
                break;
              case 'statistics':
                return <AccountStatistics />;
              break;
            }
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
        case routeNames.kROUTE_COMPANY:
          return (
            <SearchBlockHeader>
              <div className='account-container-wrapper'>
                <div className='account-container'>
                  <CompanyInfo />
                </div>
              </div>
            </SearchBlockHeader>
          );
          break;
        case routeNames.kROUTE_AFTER_REGISTER:
          return (
            <SearchBlockHeader>
              <div className='account-container-wrapper'>
                <div className='account-container'>
                  <AfterRegister aa='1' />
                </div>
              </div>
            </SearchBlockHeader>
          );
          break;


				case routeNames.kROUTE_TEST_N:
					return (<PriceListSelectionBlock/>);
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

module.exports = IceMain;
