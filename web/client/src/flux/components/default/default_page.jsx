'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DefaultPageSearchBlock = require('./default_page_search_block.jsx');
var SearchAutoPartsWrapper = require('components/search_wrappers/search_auto_parts_wrapper.jsx');
var SearchConsultationWrapper = require('components/search_wrappers/search_consultation_wrapper.jsx');
/* jshint ignore:end */


var default_page_size_actions = require('actions/default_page_size_actions.js');
var default_page_size_store = require('stores/default_page_size_store.js');

var search_auto_actions = require('actions/search_auto_actions.js');


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  width: default_page_size_store.get_width (),
}),
default_page_size_store /*observable store list*/);



var style_utils = require('utils/style_utils.js');
var sass_vars = require('sass/common_vars.json')['default-page'];
var sass_input_padding = style_utils.from_px_to_number( sass_vars['input-padding'] );



var DefaultPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
  fire_change() {
    if(this.refs && this.refs.default_page_content) {
      var node = this.refs.default_page_content.getDOMNode();
     
      default_page_size_actions.default_page_size_chaged (node.clientWidth - 2*sass_input_padding);
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


  render () {
    //console.log(this.state && this.state.width);

    return (
    <div className="default-page">
      <div className="default-page-abs">
        <div className="hfm-wrapper default-page-search-height">
          <div className="default-page-wrapper default-page-search-height">
            <div ref='default_page_content' className="default-page-content big-search-block">
              <div className="default-page-logo big-logo"><span className="ap-color fl">Auto</span><span className="as-color fb">Giper</span></div>
              
              <DefaultPageSearchBlock className="big-search-block-block autoparts"
                header="ПОИСК АВТОЗАПЧАСТЕЙ"
                sample="стойка стабилизатора bmw x5"
                sample_action={search_auto_actions.show_value_changed}
                description="*Начните вводить в строку название или производителя детали и марку, модель своего автомобиля и выберите из нескольких вариантов поискового запроса.">
                  <SearchAutoPartsWrapper 
                    list_width={this.state.width}
                    placeholder="Введите название, производителя или код*" />
              </DefaultPageSearchBlock>
              <div style={{width:'1%', display: 'table-cell'}}></div>
              <DefaultPageSearchBlock className="big-search-block-block autoservices" 
                header="КОНСУЛЬТАЦИЯ МАСТЕРА"
                sample="mazda ремонт подвески"
                sample_action={search_auto_actions.show_value_changed}
                description="**Начните вводить в строку марку, модель своего автомобиля и название работ выберите из нескольких вариантов поискового запроса.">
                  <SearchConsultationWrapper list_width={this.state.width} placeholder="Введите марку автомобиля и название работ**" />
                  {/*<input className="default-page-search-block-width" type="text" placeholder="Введите марку автомобиля и название работ**"/>*/}
              
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
