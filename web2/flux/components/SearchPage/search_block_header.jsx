'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('components/mixins/raf_state_update.js');

var route_definitions = require('shared_constants/route_names.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var SearchPageSearchBlock = require('./search_page_search_block.jsx');

var AutoPartsSearchWrapper = require('components/search_wrappers/auto_part_search_wrapper.jsx');
var AutoServiceSearchWrapper = require('components/search_wrappers/autoservice_search_wrapper.jsx');


var dom_helper = require('utils/dom_helper.js');


/* jshint ignore:end */

var route_names = require('shared_constants/route_names.js');
var search_page_actions = require('actions/search_page_actions.js');

var auto_part_search_actions = require('actions/auto_part_search_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');

var search_page_store = require('stores/search_page_store.js');
var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');
var autoservice_by_id_store = require('stores/autoservice_by_id_store.js');

import searchDataStoreAP from 'stores/searchDataStoreAP.js';
import searchDataStoreAS from 'stores/searchDataStoreAS.js';

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    width: search_page_store.get_search_page_width(),
    auto_part_data: searchDataStoreAP.getHeader(),
    autoservice_data: searchDataStoreAS.getHeader(),
  }),
search_page_store, auto_part_by_id_store, autoservice_by_id_store /*observable store list*/);

var style_utils = require('utils/style_utils.js');
var sass_vars = require('common_vars.json')['search-page'];
var kSASS_INPUT_PADDING = style_utils.from_px_to_number( sass_vars['input-right-padding'] ) + 
                         style_utils.from_px_to_number( sass_vars['input-left-padding'] ) +
                         2*style_utils.from_px_to_number( sass_vars['border-width'] );

var kSEARCH_PAGE_TOP =  style_utils.from_px_to_number(sass_vars["search-page-main-fixed-top"]);


var kRECALC_WIDTH_TIMEOUT = 200;
var kDEFAULT_REGION_ID = 'moskva';
var SearchBlockHeader = React.createClass({
  mixins: [PureRenderMixin , RafBatchStateUpdateMixin],

  fire_change() {      
    var node = dom_helper.query_selector('body');
    //if(this.refs && this.refs.default_page_content) {
    //var node = this.refs.default_page_content.getDOMNode();
    //var node_h = this.refs.main_content.getDOMNode();
    search_page_actions.search_page_size_chaged (node.clientWidth, node.clientHeight - kSEARCH_PAGE_TOP);
    //}

  },

  handle_resize() {
    this.fire_change();
  },

  componentDidMount() {
    window.addEventListener('resize', this.handle_resize);
    this.fire_change();
    setTimeout(() => this.fire_change(), kRECALC_WIDTH_TIMEOUT); //layout render
  },

  componentWillUnmount() {    
    window.removeEventListener('resize', this.handle_resize);
  },

  on_auto_parts_value_changed(id, articul, producer, sentence) {
    search_page_actions.goto_auto_parts_page(id, articul, producer, sentence);
  },

  on_auto_service_value_changed(id, auto_mark, name) {    
    search_page_actions.goto_auto_service_page(id, auto_mark, name);
  },

  render() {
    var autoparts_initial_value = this.state.auto_part_data ? this.state.auto_part_data.get('name') : '';
    var autoservice_initial_value = this.state.autoservice_data ? this.state.autoservice_data.get('service') : '';


    /* jshint ignore:start */

    return (
      <div className="search-page">
        {/*логотипчик*/}
        <div className="search-page-container search-page-logo-margin">
          <div className="wrap gutter-5-xs">
            <div className="md-12-6">
              <div className="search-page-logo">
                <Link href={route_definitions.kROUTE_DEF_W_REGION}             params={ {
                  region_id : kDEFAULT_REGION_ID
                } }>
                  <img className="search-page-logo-icon" src={require('images/logo.jpg')} alt=""/>

                  {/*<span className="search-page-logo-second">Giper</span>*/}
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/*поисковые формочки*/}
        <div ref='default_page_content' className="search-page-container mT10">
          <div className="wrap gutter-15-xs">

            <SearchPageSearchBlock 
              sample="* Введите название, производителя или код"
              description="1) Начните вводить... 2) Выберите строку из выпадающего списка."
              className="md-12-6 autoparts">
              <AutoPartsSearchWrapper
                initial_value={autoparts_initial_value}
                placeholder="Поиск автозапчатей *"
                on_value_changed={this.on_auto_parts_value_changed} />
                {/*list_width={this.state.width - kSASS_INPUT_PADDING}*/}
            </SearchPageSearchBlock>

            <SearchPageSearchBlock 
              sample="** Введите марку автомобиля и название работ"
              description="1) Начните вводить... 2) Выберите строку из выпадающего списка."
              className="md-12-6 autoservices">
                  <AutoServiceSearchWrapper
                    initial_value={autoservice_initial_value}
                    placeholder="Консультация мастера **" 
                    on_value_changed={this.on_auto_service_value_changed} />
                    {/*list_width={this.state.width - kSASS_INPUT_PADDING} */}
            </SearchPageSearchBlock>
          </div>          
        </div>
        
        
        {this.props.children}
        
      </div>
    );
    /* jshint ignore:end */    
  }
});

module.exports = SearchBlockHeader;

