'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DefaultPageSearchBlock = require('./default_page_search_block.jsx');
var AutoPartsSearchWrapper = require('components/search_wrappers/auto_part_search_wrapper.jsx');
var AutoServiceSearchWrapper = require('components/search_wrappers/autoservice_search_wrapper.jsx');
/* jshint ignore:end */

var default_page_actions = require('actions/default_page_actions.js');
var auto_part_search_actions = require('actions/auto_part_search_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');

var default_page_size_store = require('stores/default_page_size_store.js');
var region_store = require('stores/region_store.js');

var suggestion_store_ap = require('stores/auto_part_suggestion_store.js');
var suggestion_store_as = require('stores/autoservices_suggestion_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    width: default_page_size_store.get_width(),
    modalIsOpen: modalStore.getModalIsOpen(),
  }),
  default_page_size_store, modalStore /*observable store list*/);

var style_utils = require('utils/style_utils.js');
var sass_vars = require('common_vars.json')['default-page'];
var kSASS_INPUT = style_utils.from_px_to_number(sass_vars['input-padding']);

var kLIST_DELTA = 9; //сумма толщин бордеров - потом посчитаю и хз откуда 1 пиксель
var kRECALC_WIDTH_TIMEOUT = 200;

import Modal from 'components/modal/index';
import modalStore from 'stores/ModalStore.js';
import modalActions from 'actions/ModalActions.js';

var DefaultPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  fire_change() {
    if (this.refs && this.refs.default_page_content) {
      var node = this.refs.default_page_content.getDOMNode();
      default_page_actions.default_page_size_chaged(node.clientWidth - 2 * kSASS_INPUT - kLIST_DELTA);
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
  click_search(e) {

    var el = suggestion_store_ap.get_suggestion_list().get(0);
    if (!!el) {
      var el = el.toJS();
      var region_id = region_store.get_region_current().get('translit_name');
      default_page_actions.goto_auto_parts_page(region_id, el[0], el[1], el[2], el[3]);
    }
  },
  click_search_as(e) {
    ;

    var el = suggestion_store_as.get_suggestion_list().get(0);
    if (!!el) {
      var el = el.toJS();
      var region_id = region_store.get_region_current().get('translit_name');
      default_page_actions.goto_auto_service_page(region_id, el[0], el[1], el[2], el[3]);
    }
  },
  onClickCloseModal() {
    modalActions.closeModal();
  },
  onClickShowModal() {
    modalActions.openModal('video_main');
  },
  render() {
    var ap_initial_value = '';
    var as_initial_value = '';
    if (this.props.route_context.service == 'autoparts') {
      ap_initial_value = this.props.route_context.search_text.replace(/[_]/g, ' ');
    }
    if (this.props.route_context.service == 'autoservices') {
      as_initial_value = this.props.route_context.search_text.replace(/[_]/g, ' ');
      ;
    }
    return (
      <div className="default-page">
        <div className="">
          <div className="hfm-wrapper default-page-search-height">
            <div className="default-page-search-height">
              <div ref='default_page_content' className="default-page-content big-search-block">
                <div className="default-page-logo">
                  <span className="svg-logo default-page-logo-icon"></span>
                  <br />
                  <span
                    className="c-as tt-u cur-p d-ib"
                    onClick={this.onClickShowModal}
                  >
                    <i
                      className="flaticon-right fs16 br50 b4s"
                      style={{padding: '8px 7px 8px 11px'}}
                    />
                    <span className="fs18 c-ap">Обучающее видео</span>
                  </span>
                </div>

                <DefaultPageSearchBlock className="big-search-block-block autoparts"
                  header="ПОИСК АВТОЗАПЧАСТЕЙ"
                  onSearch={this.click_search}
                  sample="фильтр салонный mazda 3"
                  sample_action={auto_part_search_actions.show_value_changed}
                  description="1) Начните вводить... 2) Выберите строку из выпадающего списка.">
                  <AutoPartsSearchWrapper
                    list_width={this.state.width}
                    placeholder="Введите название, производителя или код*"
                    on_value_changed={this.on_auto_parts_value_changed}
                    initial_value={ap_initial_value}
                    isOpen={!!ap_initial_value}/>

                </DefaultPageSearchBlock>
                <div style={{width: '1%', display: 'table-cell'}}></div>
                <DefaultPageSearchBlock className="big-search-block-block autoservices"
                  header="КОНСУЛЬТАЦИЯ МАСТЕРА"
                  onSearch={this.click_search_as}
                  sample="mazda ремонт"
                  sample_action={autoservices_search_actions.show_value_changed}
                  description="1) Начните вводить... 2) Выберите строку из выпадающего списка.">

                  <AutoServiceSearchWrapper
                    list_width={this.state.width}
                    placeholder="Введите марку автомобиля и название работ**"
                    on_value_changed={this.on_auto_service_value_changed}
                    initial_value={as_initial_value}
                    isOpen={!!as_initial_value}/>
                </DefaultPageSearchBlock>
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('video_main')}
          onRequestClose={this.onClickCloseModal}
        >
          <div className='ta-C'>
            <div className='ReactModal__Content-close btn-close cur-p' onClick={this.onClickCloseModal}></div>
            <h2 className='m15-0 mB20'>Обучающее видео</h2>
            <iframe className="b0" width="560" height="315" src="https://www.youtube.com/embed/YVJKPxTUcLQ?rel=0&amp;controls=0&amp;showinfo=0&autoplay=1" frameborder="0" allowfullscreen></iframe>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = DefaultPage;
