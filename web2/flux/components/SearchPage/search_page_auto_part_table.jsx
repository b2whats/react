'use strict';

var _ = require('underscore');

import React, {PropTypes, Component} from 'react/addons';
import emptyFunction from 'react/lib/emptyFunction';

import rafStateUpdate from 'components/hoc/raf_state_update.js';
var cx        = require('classnames');

var sc = require('shared_constants');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('components/mixins/raf_state_update.js');
var PointerEventDisablerMixin = require('components/mixins/pointer_event_disabler_mixin.js');






var point_utils = require('utils/point_utils.js');
var text_utils = require('utils/text.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Pager = require('components/pager/pager.jsx');
var FixedTooltip = require('components/tooltip/fixed_tooltip.jsx');
/* jshint ignore:end */

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
var auto_part_search_actions = require('actions/auto_part_search_actions.js');

var fixed_tooltip_actions = require('actions/fixed_tooltip_actions.js');

import searchDataStoreAP from 'stores/searchDataStoreAP.js';
import searchActionsAP from 'actions/searchActionsAP.js';

import controllable from 'react-controllables';

/*Utils*/
import autobind from 'utils/autobind.js';
import Link from 'components/link.jsx';
import regionStore from 'stores/region_store.js';
//var search_page_actions = require('actions/search_page_actions.js');
var kITEMS_PER_PAGE = sc.kITEMS_PER_PAGE;
var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...

/*Action*/
import ModalActions from 'actions/ModalActions.js';
import Order from './Order.jsx';





@controllable(['currentPage','itemPerPage', 'currentOrderItem'])
@rafStateUpdate(() => ({
  autoPartResults: searchDataStoreAP.getSortedData(),
  showAllPhone: searchDataStoreAP.getShowAllPhone().get('autoparts'),
  visiblePhone: searchDataStoreAP.getVisiblePhone(),
  firstInvisibleRowIndex: searchDataStoreAP.getFirstInvisibleRowIndex(),
  hoveredMapRowIndex: searchDataStoreAP.getMapHoveredRowIndex(),
  activeAddressId: searchDataStoreAP.getActiveAddressId(),
}), searchDataStoreAP)
export default class SearchPageAutoPartTable extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }
  static defaultProps = {
    currentPage: 1,
    itemPerPage: 10,
    currentOrderItem: null
  }
  static propTypes = {
    currentPage: PropTypes.number.isRequired,
    itemPerPage: PropTypes.number.isRequired,
    onCurrentPageChange: PropTypes.func,
    onItemPerPageChange: PropTypes.func,
    onCurrentOrderItemChange: PropTypes.func,
  }
  onCurrentPageChange(num) {
    let current = num + 1;
    let end = current * this.props.itemPerPage;
    let start = end - this.props.itemPerPage;
    searchActionsAP.visibleRowsChange(start, end);
    this.props.onCurrentPageChange(current);
  }
  onItemPerPageChange(num) {
    let end = this.props.currentPage * num;
    let start = end - num;

    searchActionsAP.visibleRowsChange(start, end);
    this.props.onItemPerPageChange(num);
  }

  on_show_price_tootip(id, tooltip_type, e) {
    e.preventDefault();
    e.stopPropagation();
    fixed_tooltip_actions.show_fixed_tooltip(id, tooltip_type);
  }
  on_goto_find(id, auto_part_initial_value, e) {
    auto_part_search_actions.show_value_changed(auto_part_initial_value);
    e.preventDefault();
    e.stopPropagation();
  }
  onVisiblePhoneChange(userId) {
    searchActionsAP.visiblePhoneChange(userId);
  }
  onShowAllPhoneChange(type) {
    searchActionsAP.showAllPhoneChange(type);
  }
  onShowOrderPopup(currentItem, e) {
    e.preventDefault();
    e.stopPropagation();
    ModalActions.openModal('order1');
    this.props.onCurrentOrderItemChange(currentItem);
  }
  onRowMouseEnter(index) {
    searchActionsAP.rowHover(index, true);
  }
  onRowMouseLeave(index) {
    searchActionsAP.rowHover(index, false);
  }
  onRowAddressActive(id) {
    // Один метод на 2 сторы с балунами !!! Записываем только в 1 стору
    if (this.props.activeAddressId === id) {
      searchActionsAP.rowAddressActive(null, false);
    } else {
      searchActionsAP.rowAddressActive(id, true);
    }
  }

  onClickCloseModal() {

    ModalActions.closeModal();
  }
  render() {
    if (this.props.autoPartResults.size === 0) return null
    let end = this.props.currentPage * this.props.itemPerPage;
    let start = end - this.props.itemPerPage;
    const Markers  = this.props.autoPartResults
      .slice(start, end)
      .map((part, part_index) => {
        let company = part.get('addresses').first();

        let stock_class_name = {};
        /*1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"*/
        const kSTOCK_ICONS     = ['', 'icon_box-check',     'icon_car', 'icon_car', 'icon_car', 'icon_car', 'icon_car', 'icon_car'];
        const kSTOCK_ICONS_ADD = ['stock_empty', 'stock_empty', 'stock-2',    'stock-7',   'stock-14',  'stock-31',     'stock_empty',  'stock_empty'];
        stock_class_name[kSTOCK_ICONS[part.get('stock')]] = true;
        stock_class_name[kSTOCK_ICONS_ADD[part.get('stock')]] = true;
        let isVisiblePhone = !!(this.props.visiblePhone.indexOf(part.get('user_id')) + 1);
        let currentIndex = this.props.itemPerPage * (this.props.currentPage - 1) + part_index;
        let inDisplay = true;
        if (this.props.firstInvisibleRowIndex <= currentIndex) inDisplay = false;
        let currentRegion =  regionStore.get_region_current() && regionStore.get_region_current().get('translit_name');
      return (
        <tr
          onMouseEnter={this.onRowMouseEnter.bind(null, part.get('user_id'))}
          onMouseLeave={this.onRowMouseLeave.bind(null, part.get('user_id'))}
          onClick={this.onRowAddressActive.bind(null, company.get('id'))}
          className={cx((part_index % 2 > 0) && 'bgc-grey-100', this.props.firstInvisibleRowIndex === currentIndex && 'bT4s bc-deep-purple-500', this.props.hoveredMapRowIndex === part.get('user_id') && 'bgc-grey-300')}
          key={part_index}
        >
          <td className={cx('search-page-autopart-table-td-rank') }>
            <span className='nap'>{part.get('rank')}</span>
          </td>

          <td>

            <div className="lh1-4 ellipsis big-first">{company.get('company_name')}</div>
            <div className='ellipsis'>
              <span
                className="bb-d c-g cur-p lh1-4"
              >
                {!inDisplay ?
                  <Link
                    href={`/company/${part.get('user_id')}/${currentRegion}`}
                    className={cx('td-u cur-p c-grey-700')}
                  >
                    {company.get('address')}
                  </Link>
                  :
                  company.get('address')
                }

              </span>
            </div>
            <div className="f-R">
            <FixedTooltip
              open_id={part.get('id')}
              open_type={'autopart-tooltip-adresses'}
            >

              <strong className='fs12'>Все адреса</strong>

              <div className="search-page-auto-part-table-body-work-tooltip-list fs12">
                {part.get('addresses').filter( m => m.get('visible_address') ).map( (m, index) =>
                  <div
                    className="search-page-auto-part-table-body-work-tooltip-list-address" key={index} >
                    <span className='c-p bb-d cur-p'>{m.get('address')}</span>
                  </div> ).toJS()}
              </div>
            </FixedTooltip>
            </div>
          </td>

          <td className="search-page-autopart-table-td-manufacturer-code">
              {!inDisplay ?
                <div>
                  <Link
                    href={`/company/${part.get('user_id')}/${currentRegion}`}
                    className={cx('H-td-u cur-p c-grey-900 lh1-4 fw-b ellipsis d-ib big-first')}
                  >
                    {part.get('manufacturer')}
                  </Link>
                  <br />
                  <Link
                  href={`/company/${part.get('user_id')}/${currentRegion}`}
                  className={cx('H-td-u cur-p c-grey-700 lh1-4 fw-b ellipsis d-ib big-first')}
                  >
                    {part.get('code')}
                  </Link>
                </div>
                :
                <div>
                  <div className="lh1-4 fw-b ellipsis big-first">{part.get('manufacturer')}</div>
                  <div className="c-g big-first">{part.get('code')}</div>
                </div>
              }

          </td>

          <td className="search-page-autopart-table-td-part-description">
            <div className='h35px o-h to-e'>
              <span onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autopart-tooltip-part-description')}
                className="fs13 c-p bb-d cur-p lh1-4">
                {part.get('name')}
              </span>
            </div>
            <div className='f-R'>
              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autopart-tooltip-part-description'}
                className="search-page-auto-part-table-body-work-tooltip">

                <div className='mB10  fw-b fs14'>Описание детали</div>
                <div className="search-page-auto-part-table-body-work-tooltip-list">
                      {part.get('code')}<br/>
                      {part.get('name')}<br/>
                </div>

                <hr className='hr'/>

                <div className="c-p">
                  <i className='svg-icon_gear fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретную деталь? <br/>
                    Наберите ее в поиске
                  </span>
                </div>
              </FixedTooltip>
            </div>
          </td>
          <td className='ta-C'>
            <span className={cx('fs25 va-M m0-5', cx(part.get('used') ? 'svg-icon_no-use' : 'svg-icon_use'))}></span>
            <span className={cx('fs23 va-M m0-5', cx(stock_class_name))}></span>
            {/*1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"*/}
          </td>
          <td className={cx('', cx((part_index%2 > 0) ? 't-bg-c-ap-m' : 't-bg-c-ap-l'))}>
            <div className="fs18 fw-b m0-5 lh1">
              {part.get('retail_price')} р.
              <div className="c-deep-purple-500 cur-p fw-n fs9 mT5"  onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autopart-tooltip-price')}>Условия оплаты</div>


            </div>
            <div className="">
              <div className='f-R'>
                <FixedTooltip className="search-page-autopart-table-price-link-tooltip" open_id={part.get('id')} open_type={'autopart-tooltip-price'}>
                  {part.get('conditions') && [
                    <div key={0} className='fs14 mB10 mR20 fw-b'>Условия оплаты</div>,
                    <div key={1}>{part.get('conditions').has('price_retail') && 'Розничная цена.'}</div>,
                    <div key={2}>{part.get('conditions').has('price_if_our_service') && 'Действительна при установке на нашем сервис центре.'}</div>,
                    <div key={3}>{part.get('conditions').has('delivery_free_msk') && 'Бесплатная доставка по МСК.'}</div>,
                    <div key={4}>{part.get('conditions').has('delivery_free_spb') && 'Бесплатная доставка по СПб.'}</div>,
                    <div key={5}>{part.get('conditions').has('price_only_for_legal_person') && 'Только для юр.лиц'}</div>,
                    <div key={6}>{part.get('conditions').has('price_above_level_0') && 'Цена покупки от 20 000 р'}</div>,
                    <div key={7}>{part.get('conditions').has('price_above_level_1') && 'Цена покупки от 40 000 р'}</div>
                  ]}
                </FixedTooltip>
              </div>
            </div>

          </td>
          <td>
            <div className={cx('ta-C fs20', !(this.props.showAllPhone || isVisiblePhone) && 'd-N')}>
              <span className='fs14'>{company.get('main_phone') && company.get('main_phone').substr(0,7)}</span>
              <span>{company.get('main_phone') && company.get('main_phone').substr(7)}</span>
            </div>
            <div className={cx('entire-width', (this.props.showAllPhone || isVisiblePhone) && 'd-N')}>
              <button
                onClick={this.onVisiblePhoneChange.bind(null, part.get('user_id'))}
                className={cx('p8 br2 grad-w b0 btn-shad-b ta-C', (part.get('order_type') === 0) && 'w48pr', (part.get('order_type') === 1) && 'w100pr', (part.get('order_type') === 2) && 'd-N' )}
              >
                <span className="table-line w100pr ta-C">
                  <span className="d-tc va-m ta-C"><i className="flaticon-phone c-ap fs16" /></span>
                  <span className='M-d-n-1420 va-m'>Телефон</span>
                </span>
              </button>
              <button
                onClick={this.onShowOrderPopup.bind(null, currentIndex)}
                className={cx('p8 br2 grad-w b0 btn-shad-b ta-C', (part.get('order_type') === 0) && 'w48pr', (part.get('order_type') === 2) && 'w100pr', (part.get('order_type') === 1) && 'd-N' )}
              >
                <i className="flaticon-mail c-ap fs16 mR5"></i>
                <span className='M-d-n-1420'>Заявка</span>
              </button>
            </div>
          </td>
        </tr>
        )
      }
    ).toJS();

    const ItemsPerPage = kITEMS_PER_PAGE.map((item, index) => (
      <a
        key={index}
        onClick={this.onItemPerPageChange.bind(null, item)}
        className={cx('bc-g cur-p', cx(item === this.props.itemPerPage && 'active'))}
      >
        {item}
      </a>
    ));

    return (
      <div className={this.props.className}>
        <div className="entire-width flex-ai-c m20-0 h30px">
            <div className="m0-10 fs18">
                <span>Найдено </span>
                <strong className='c-ap'>{this.props.autoPartResults.size} </strong>
                <span>{['предложение', 'предложения', 'предложений'][text_utils.decl_num(this.props.autoPartResults.size)]}</span>
            </div>
            {(this.props.autoPartResults.size > 0) &&
              <div className="m0-20">
                <span className='mR15'>Показывать по</span>
                <span className="show-by border-between-h bc-g">
                  {ItemsPerPage}
                </span>
              </div>
            }
        </div>

        <table cellSpacing="0" className='search-table'>
          <thead>
            <tr className='bg-c-gl ta-L'>
              <th className='w40px'>
                <i className='icon_placemark-grey'></i>
              </th>
              <th className=''>Продавец</th>
              <th className='w140px'>Производитель<br/>Артикул</th>
              <th className=''>Описание детали</th>
              <th className='ta-C w90px'>Инфо</th>
              <th className='ta-C c-wh w95px t-bg-c-ap fw-b'>Цена</th>
              <th className='ta-C w210px'>
                <label className="label--checkbox">
                  <input
                    type="checkbox"
                    checked={this.props.showAllPhone}
                    disabled={this.props.showAllPhone}
                    onChange={this.onShowAllPhoneChange.bind(null, 'autoparts')}
                    className="checkbox"
                  />
                  <span className='m0-5'>Показать телефоны</span>
                </label>
              </th>
            </tr>
          </thead>

          <tbody>
                {Markers}
          </tbody>
        </table>

        <div className="ta-R m20">
          <Pager className="pagination fs14"
            page_num={this.props.currentPage - 1}
            items_per_page={this.props.itemPerPage}
            results_count={this.props.autoPartResults.size}
            pages_on_screen={kPAGES_ON_SCREEN}
            on_click={this.onCurrentPageChange}/>

        </div>

        <Order type={1} item={this.props.autoPartResults.get(this.props.currentOrderItem)} onClickCloseModal={this.onClickCloseModal}/>


        <hr className="search-page-hr" />
      </div>
    );
    /* jshint ignore:end */
  }
}


