'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var route_definitions = require('shared_constants/route_names.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var SearchPageSearchBlock = require('./search_page_search_block.jsx');
var SearchPageYandexMap = require('./search_page_yandex_map.jsx');

var AutoPartsSearchWrapper = require('components/search_wrappers/auto_part_search_wrapper.jsx');
var AutoServiceSearchWrapper = require('components/search_wrappers/autoservice_search_wrapper.jsx');
/* jshint ignore:end */

var search_page_actions = require('actions/search_page_actions.js');

var auto_part_search_actions = require('actions/auto_part_search_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');

var search_page_store = require('stores/search_page_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  width: search_page_store.get_search_page_width (),
}),
search_page_store /*observable store list*/);

var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['search-page'];
var sass_input_padding = style_utils.from_px_to_number( sass_vars['input-right-padding'] ) + 
                         style_utils.from_px_to_number( sass_vars['input-left-padding'] ) +
                         2*style_utils.from_px_to_number( sass_vars['border-width'] );




var kRECALC_WIDTH_TIMEOUT = 200;

var SearchPage = React.createClass({
  mixins: [PureRenderMixin , RafBatchStateUpdateMixin],

  fire_change() {      
    if(this.refs && this.refs.default_page_content) {
      var node = this.refs.default_page_content.getDOMNode();     
      search_page_actions.search_page_size_chaged (node.clientWidth);
    }  
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
    var autoparts_initial_value='Надо API см issue #6';// + '  ' + Math.random();
    /*flexbox  класс пока не использую чтобы работало везде*/
    /* jshint ignore:start */
    return (
      <div className="search-page">
        {/*логотипчик*/}
        <div className="search-page-container search-page-logo-margin">
          <div className="wrap gutter-5-xs">
            <div className="md-12-6">
              <div className="search-page-logo">
                <Link href={route_definitions.kROUTE_DEF_W_REGION}>
                  <span className="search-page-logo-first">Auto</span>
                  <span className="search-page-logo-second">Giper</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/*поисковые формочки*/}
        <div ref='default_page_content' className="search-page-container">
          <div className="wrap gutter-5-xs">
            <SearchPageSearchBlock 
              sample="* Введите название, производителя или код"
              className="md-12-6 autoparts">
              <AutoPartsSearchWrapper
                initial_value={autoparts_initial_value}
                list_width={this.state.width - sass_input_padding}
                placeholder="Поиск автозапчатей *"
                on_value_changed={this.on_auto_parts_value_changed} />
            </SearchPageSearchBlock>

            <SearchPageSearchBlock 
              sample="** Введите марку автомобиля и название работ"
              className="md-12-6 autoservices">
                  <AutoServiceSearchWrapper 
                    list_width={this.state.width - sass_input_padding} 
                    placeholder="Консультация мастера **" 
                    on_value_changed={this.on_auto_service_value_changed} />
            </SearchPageSearchBlock>
          </div>          
        </div>
        
        {/*карта с заголовком*/}
        <div className="search-page-container">
          <div className="wrap gutter-5-xs">
            <SearchPageYandexMap className="md-12-12">
            </SearchPageYandexMap>
          </div>
        </div>
        
        {/*результаты поиска заголовок*/}
        <div className="search-page-container">
          <div className="wrap gutter-5-xs">
            <div className="md-12-6 left-md search-page-info-header">              
                <span>Найдено</span>&nbsp;
                <strong>123</strong>&nbsp;
                <span>предложений</span>              
            </div>
            
            <div className="md-12-6 right-md search-page-info-header">              
                <span>Показывать по</span>
                <span className="pager-buttons">
                  <a href="">1</a>
                  <a href="">2</a>
                  <a href="">...</a>
                  <a href="">30</a>
                </span>              
            </div>
          </div>
        </div>

        {/*результаты поиска таблички*/}

        <div className="search-page-container">
          <div className="wrap gutter-5-xs">
            <div className="md-12-12">
              <div className="search-page-table-border">
                <table cellSpacing="0" className="pure-table pure-table-striped search-page-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Year</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Honda</td>
                            <td>Accord</td>
                            <td>2009</td>
                        </tr>

                        <tr>
                            <td>2</td>
                            <td>Toyota</td>
                            <td>Camry</td>
                            <td>2012</td>
                        </tr>

                        <tr>
                            <td>3</td>
                            <td>Hyundai</td>
                            <td>Elantra</td>
                            <td>2010</td>
                        </tr>
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */    
  }
});

module.exports = SearchPage;

