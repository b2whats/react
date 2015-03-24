'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');

var AutoPartsSearchWrapper = require('components/search_wrappers/auto_part_search_wrapper.jsx');
var AutoServiceSearchWrapper = require('components/search_wrappers/autoservice_search_wrapper.jsx');
/* jshint ignore:end */


var default_page_actions = require('actions/default_page_actions.js');
var auto_part_search_actions = require('actions/auto_part_search_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');


var default_page_size_store = require('stores/default_page_size_store.js');
var region_store = require('stores/region_store.js');


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  width: default_page_size_store.get_width (),
}),
default_page_size_store /*observable store list*/);



var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['default-page'];
var kSASS_INPUT = style_utils.from_px_to_number( sass_vars['input-padding'] );


var kLIST_DELTA=9; //сумма толщин бордеров - потом посчитаю и хз откуда 1 пиксель
var kRECALC_WIDTH_TIMEOUT = 200;

var DefaultPageSearchBlock = React.createClass({


  mixins: [PureRenderMixin],

  sample_click(e) {
    this.props.sample_action(this.props.sample);
    e.preventDefault();
    e.stopPropagation();
  },

  render () {

    return (
      <div className={this.props.className}>
        <h2 className="default-page-search-block-header">
          <span className="text-free-icon">{this.props.header}</span>
        </h2>

        <div className="default-page-search-block-content">
          <table className="default-page-search-block-width">
            <tr className="default-page-search-block-width stylized-input text_btn">
              <td className="default-page-search-block-width">
                    {this.props.children}
              </td>
              <td><button>Найти</button></td>
            </tr>
          </table>
        </div>

        <div className="big-search-block__hint">
          <span className="default-page-forexample">Например:</span>
          <a onClick={this.sample_click} href="#">{this.props.sample}</a>
        </div>
        <div className="big-search-block__description">
            {this.props.description}
        </div>
      </div>
    );
  }
});

var DefaultPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  fire_change() {
    if(this.refs && this.refs.default_page_content) {
      var node = this.refs.default_page_content.getDOMNode();     
      default_page_actions.default_page_size_chaged (node.clientWidth - 2*kSASS_INPUT - kLIST_DELTA);
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
    var region_id = region_store.get_region_current().get('translit_name');
    default_page_actions.goto_auto_parts_page(region_id, id, articul, producer, sentence);
  },
  
  on_auto_service_value_changed(id, auto_mark, name) {    
    var region_id = region_store.get_region_current().get('translit_name');
    default_page_actions.goto_auto_service_page(region_id, id, auto_mark, name);
  },

  render () {
    var ap_initial_value = '';
    var as_initial_value = '';
    if (this.props.route_context.service == 'autoparts') {
      ap_initial_value = this.props.route_context.search_text.replace(/[_]/g,' ');
    }
    if (this.props.route_context.service == 'autoservices') {
      as_initial_value = this.props.route_context.search_text.replace(/[_]/g,' ');;
    }
    return (
    <div className="default-page">
      <div className="default-page-abs">
        <div className="hfm-wrapper default-page-search-height">
          <div className="default-page-wrapper default-page-search-height">
            <div ref='default_page_content' className="default-page-content big-search-block">
              <div className="default-page-logo"><span className="svg-logo default-page-logo-icon"></span></div>
              
              <DefaultPageSearchBlock className="big-search-block-block autoparts"
                header="ПОИСК АВТОЗАПЧАСТЕЙ"
                sample="стойка стабилизатора bmw x5"
                sample_action={auto_part_search_actions.show_value_changed}
                description="*Начните вводить в строку название или производителя детали и марку, модель своего автомобиля и выберите из нескольких вариантов поискового запроса.">
                  <AutoPartsSearchWrapper 
                    list_width={this.state.width}
                    placeholder="Введите название, производителя или код*"
                    on_value_changed={this.on_auto_parts_value_changed}
                    initial_value={ap_initial_value}/>
              </DefaultPageSearchBlock>
              <div style={{width:'1%', display: 'table-cell'}}></div>
              <DefaultPageSearchBlock className="big-search-block-block autoservices" 
                header="КОНСУЛЬТАЦИЯ МАСТЕРА"
                sample="mazda ремонт"
                sample_action={autoservices_search_actions.show_value_changed}
                description="**Начните вводить в строку марку, модель своего автомобиля и название работ выберите из нескольких вариантов поискового запроса.">
                  <AutoServiceSearchWrapper 
                    list_width={this.state.width} 
                    placeholder="Введите марку автомобиля и название работ**" 
                    on_value_changed={this.on_auto_service_value_changed}
                    initial_value={as_initial_value}/>
              </DefaultPageSearchBlock>
            </div>
          </div>
        </div>      
      </div>
    </div>
    );
  }
});

module.exports = DefaultPage;
