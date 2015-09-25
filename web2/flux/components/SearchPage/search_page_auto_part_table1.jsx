'use strict';

var _ = require('underscore');

import React, {PropTypes, Component} from 'react/addons';

import rafStateUpdate from 'components/hoc/raf_state_update.js';
var cx = require('classnames');

var sc = require('shared_constants');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');
var PointerEventDisablerMixin = require('components/mixins/pointer_event_disabler_mixin.js');

var point_utils = require('utils/point_utils.js');
var text_utils = require('utils/text.js');

/* jshint ignore:start */

var Pager = require('components/pager/pager.jsx');
var FixedTooltip = require('components/tooltip/fixed_tooltip.jsx');
/* jshint ignore:end */

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');
var auto_part_search_actions = require('actions/auto_part_search_actions.js');

var fixed_tooltip_actions = require('actions/fixed_tooltip_actions.js');

import searchDataStoreAS from 'stores/searchDataStoreAS.js';
import searchDataStoreAP from 'stores/searchDataStoreAP.js';
import searchActionsAS from 'actions/searchActionsAS.js';
import searchActionsAP from 'actions/searchActionsAP.js';

import controllable from 'react-controllables';

/*Utils*/
import autobind from 'utils/autobind.js';
import arrayCompare from 'utils/arrayCompare.js';

/*Action*/
import ModalActions from 'actions/ModalActions.js';
import Order from './Order.jsx';
import statisticsActions from 'actions/statisticsActions.js';

import Link from 'components/link.jsx';
import regionStore from 'stores/region_store.js';
//var search_page_actions = require('actions/search_page_actions.js');
var kITEMS_PER_PAGE = [5, 10, 20];
var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...

@controllable(['currentPage', 'itemPerPage', 'currentOrderItem'])
@rafStateUpdate(() => ({
  autoServicesResults: searchDataStoreAS.getSortedData(),
  showAllPhone: searchDataStoreAS.getShowAllPhone().get('autoservices'),
  visiblePhone: searchDataStoreAS.getVisiblePhone(),
  firstInvisibleRowIndex: searchDataStoreAS.getFirstInvisibleRowIndex(),
  hoveredMapRowIndex: searchDataStoreAS.getMapHoveredRowIndex(),
  activeAddressId: searchDataStoreAP.getActiveAddressId(),
}), searchDataStoreAS, searchDataStoreAP)
export default class SearchPageAutoPartTable extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  static defaultProps = {
    currentPage: 1,
    itemPerPage: 5,
    currentOrderItem: null
  }
  static propTypes = {
    currentPage: PropTypes.number.isRequired,
    itemPerPage: PropTypes.number.isRequired,
    onCurrentPageChange: PropTypes.func,
    onItemPerPageChange: PropTypes.func,
    onCurrentOrderItemChange: PropTypes.func,
  }
  componentWillMount() {
    this.companyIds = [];
  }
  onCurrentPageChange(num) {

    let current = num + 1;
    let end = current * this.props.itemPerPage;
    let start = end - this.props.itemPerPage;
    searchActionsAS.visibleRowsChange(start, end);
    this.props.onCurrentPageChange(current);
  }

  onItemPerPageChange(num) {
    let end = num * this.props.itemPerPage;
    let start = end - this.props.itemPerPage;
    searchActionsAS.visibleRowsChange(start, end);
    this.props.onItemPerPageChange(num);
  }

  on_show_price_tootip(id, tooltip_type, e) {

    fixed_tooltip_actions.show_fixed_tooltip(id, tooltip_type);
    e.preventDefault();
    e.stopPropagation();
  }

  on_goto_find(id, auto_part_initial_value, e) {
    auto_part_search_actions.show_value_changed(auto_part_initial_value);
    e.preventDefault();
    e.stopPropagation();
  }

  onVisiblePhoneChange(userId) {
    statisticsActions.setStatistics('as', 'click', [userId]);
    searchActionsAS.visiblePhoneChange(userId);
  }

  onShowAllPhoneChange(type) {
    searchActionsAS.showAllPhoneChange(type);
  }

  onShowOrderPopup(currentItem, userId, e) {
    e.preventDefault();
    e.stopPropagation();

    statisticsActions.setStatistics('as', 'click', [userId]);
    this.props.onCurrentOrderItemChange(currentItem);
    ModalActions.openModal('order2');
  }
  onClickCloseModal() {

    ModalActions.closeModal();
  }
  onRowMouseEnter(index) {
    searchActionsAS.rowHover(index, true);
  }

  onRowMouseLeave(index) {
    searchActionsAS.rowHover(index, false);
  }

  onRowAddressActive(id, userId) {
    statisticsActions.setStatistics('as', 'click', [userId]);
    // Один метод на 2 сторы с балунами !!! Записываем только в 1 стору
    if (this.props.activeAddressId === id) {
      searchActionsAP.rowAddressActive(null, false);
    } else {
      searchActionsAP.rowAddressActive(id, true);
    }
  }

  render() {
    let end = this.props.currentPage * this.props.itemPerPage;
    let start = end - this.props.itemPerPage;
    const companyIds = [];
    var TrMarkers = this.props.autoServicesResults
      .slice(start, end)
      .map((part, part_index) => {
        let company = part.get('addresses').first();

        let isVisiblePhone = !!(this.props.visiblePhone.indexOf(part.get('user_id')) + 1);
        let currentIndex = this.props.itemPerPage * (this.props.currentPage - 1) + part_index;
        let inDisplay = true;
        if (this.props.firstInvisibleRowIndex <= currentIndex) {
          inDisplay = false;
        }
        var hover_class = cx({
          hovered_same_rank: part.get('is_hovered_same_rank'), //это значит кто то в табличке или на карте навелся на ранк X
          hovered_same_address: part.get('is_hovered_same_address'),
          balloon_visible_same_rank: part.get('is_balloon_visible_same_rank'),
          balloon_visible_same_address: part.get('is_balloon_visible_same_address')
        });

        var stock_class_name = {};
        stock_class_name['stock-num-' + part.get('stock')] = true;

        let brands = part.get('brands') && part.get('brands').keySeq().toJS().join(', ');

        var kBODY_WORK_KEY = 'Кузовные работы';
        var kMETAL_WORK_KEY = 'Слесарные работы';
        var kTO_WORK_KEY = 'ТО';
        var kTUNING = 'Тюнинг и прочее';

        var body_list = part.get('services').get(kBODY_WORK_KEY) && part.get('services').get(kBODY_WORK_KEY).get('list') &&
          part.get('services').get(kBODY_WORK_KEY).get('list').map((l, index) => {
            return <div key={index}>{l}</div>;
          }).toArray();

        var metal_list = part.get('services').get(kMETAL_WORK_KEY) && part.get('services').get(kMETAL_WORK_KEY).get('list') &&
          part.get('services').get(kMETAL_WORK_KEY).get('list').map((l, index) => {
            return <div key={index}>{l}</div>;
          }).toArray();

        var to_list = part.get('services').get(kTO_WORK_KEY) && part.get('services').get(kTO_WORK_KEY).get('list') &&
          part.get('services').get(kTO_WORK_KEY).get('list').map((l, index) => {
            return <div key={index}>{l}</div>;
          }).toArray();

        var tuning_list = part.get('services').get(kTUNING) && part.get('services').get(kTUNING).get('list') &&
          part.get('services').get(kTUNING).get('list').map((l, index) => {
            return <div key={index}>{l}</div>;
          }).toArray();

        companyIds.push(part.get('user_id'));
        return (
          <tr
            onMouseEnter={this.onRowMouseEnter.bind(null, part.get('user_id'))}
            onMouseLeave={this.onRowMouseLeave.bind(null, part.get('user_id'))}
            onClick={this.onRowAddressActive.bind(null, company.get('id'), part.get('user_id'))}
            className={cx('h65px', (part_index % 2 > 0) && 'bgc-grey-100', this.props.firstInvisibleRowIndex === currentIndex && 'bT4s bc-yellow-500', this.props.hoveredMapRowIndex === part.get('user_id') && 'bgc-grey-300')}
            key={part.get('id')}
          >
            <td className={cx('search-page-autoservice-table-td-rank', hover_class)}>
              <span className='nas'>{part.get('addresses').first().get('number')}</span>
            </td>

            <td className={cx('search-page-autoservice-table-td-seller', 'tooltip', hover_class)}>

              <div className="lh1-4 ellipsis big-first">{company.get('company_name')}</div>
              <div className='ellipsis'>
                <span className="bb-d c-g cur-p lh1-4">

                  {!inDisplay ?
                    <Link
                      href={`/company/${part.get('user_id')}/${regionStore.get_region_current().get('translit_name')}`}
                      className={cx('td-u cur-p c-grey-700')}
                      onClick={statisticsActions.setStatistics.bind(null, 'as', 'click', [part.get('user_id')])}
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
                  open_type={'autoservice-tooltip-adresses'}
                >

                  <strong>Все адреса</strong>

                  <div className="search-page-autoservice-table-body-work-tooltip-list">
                  </div>

                </FixedTooltip>
              </div>

            </td>

            <td className="search-page-autoservice-table-td-auto-marks">
              <div
                className="cur-p c-yellow-800 h35px to-e o-h lh1-4"
                onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-auto-marks')} >
              {brands}
              </div>

              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-auto-marks'}
                className="ta-L">

                <strong className='fs14 mB10 d-ib'>Марки</strong>
                <div className="search-page-autoservice-table-body-work-tooltip-list">
                  {brands}
                </div>

                <hr className='hr'/>

                <div
                  className="c-yellow-800">
                  <i className='icon_key fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретную марку?
                    <br/>
                    Наберите ее в поиске
                  </span>
                </div>
              </FixedTooltip>

            </td>

            <td className="ta-C">
              <span
                className="cur-p bB1d c-yellow-800"
                onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-body-work')} >
              {part.get('services').get(kBODY_WORK_KEY) && (part.get('services').get(kBODY_WORK_KEY).get('count').get('in') + ' / ' +
              part.get('services').get(kBODY_WORK_KEY).get('count').get('all'))}
              </span>
            {/*код тултипа*/}
              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-body-work'}
                className="ta-L">

                <strong className='fs14 mB10 d-ib'>Кузовные работы</strong>
                <div className="Mh150px o-a mR-8">
                  {body_list}
                </div>

                <hr className='hr'/>

                <div
                  className="c-yellow-800">
                  <i className='icon_key fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретный вид работ?
                    <br/>
                    Наберите его в поиске
                  </span>
                </div>
              </FixedTooltip>
            </td>

            <td className="ta-C">
              <span
                className="cur-p bB1d c-yellow-800"
                onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-metal-work')} >
              {part.get('services').get(kMETAL_WORK_KEY) && (part.get('services').get(kMETAL_WORK_KEY).get('count').get('in') + ' / ' +
              part.get('services').get(kMETAL_WORK_KEY).get('count').get('all'))}
              </span>

            {/*код тултипа*/}
              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-metal-work'}
                className="ta-L">

                <strong className='fs14 mB10 d-ib'>Слесарные работы</strong>
                <div className="Mh150px o-a mR-8">
                  {metal_list}
                </div>

                <hr className='hr'/>

                <div
                  className="c-yellow-800">
                  <i className='icon_key fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретный вид работ?
                    <br/>
                    Наберите его в поиске
                  </span>
                </div>
              </FixedTooltip>

            </td>

            <td className="ta-C">
              <span
                className="cur-p bB1d c-yellow-800"
                onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-to-work')} >
              {part.get('services').get(kTO_WORK_KEY) && (part.get('services').get(kTO_WORK_KEY).get('count').get('in') + ' / ' +
              part.get('services').get(kTO_WORK_KEY).get('count').get('all'))}
              </span>
            {/*код тултипа*/}
              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-to-work'}
                className="ta-L">

                <strong className='fs14 mB10 d-ib'>ТО</strong>
                <div className="Mh150px o-a mR-8">
                  {to_list}
                </div>

                <hr className='hr'/>

                <div
                  className="c-yellow-800">
                  <i className='icon_key fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретный вид работ?
                    <br/>
                    Наберите его в поиске
                  </span>
                </div>
              </FixedTooltip>
            </td>

            <td className="ta-C">
              <span
                className="cur-p bB1d c-yellow-800"
                onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-to-work1')} >
              {part.get('services').get(kTUNING) && (part.get('services').get(kTUNING).get('count').get('in') + ' / ' +
              part.get('services').get(kTUNING).get('count').get('all'))}
              </span>
            {/*код тултипа*/}
              <FixedTooltip
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-to-work1'}
                className="ta-L">

                <strong className='fs14 mB10'>Тюнинг и прочее</strong>
                <div className="Mh150px o-a mR-8">
                  {tuning_list}
                </div>

                <hr className='hr'/>

                <div
                  className="c-yellow-800">
                  <i className='icon_key fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретный вид работ?
                    <br/>
                    Наберите его в поиске
                  </span>
                </div>
              </FixedTooltip>
            </td>

            <td className={cx('', cx((part_index % 2 > 0) ? 'bgc-yellow-200' : 'bgc-yellow-100'))}>
              <div className="fw-b fs14">{part.get('masters_name').first().split(' ')[0]}</div>
          {/*<Link href={part.get('site')} className="c-yellow-800 d-ib fs12">Сайт</Link> */}
            </td>

            <td className="search-page-autoservice-table-td-phone search-page-autoservice-table-td-multiple-btn">
              <div className={cx('ta-C fs20', !(this.props.showAllPhone || isVisiblePhone) && 'd-N')}>
                <span className='fs14'>{company.get('main_phone') && company.get('main_phone').substr(0,7)}</span>
                <span>{company.get('main_phone') && company.get('main_phone').substr(7)}</span>
              </div>
              <div className={cx('entire-width', (this.props.showAllPhone || isVisiblePhone) && 'd-N')}>
                <button
                  onClick={this.onVisiblePhoneChange.bind(null, part.get('user_id'))}
                  className={cx('p8 br2 grad-w b0 btn-shad-b ta-C', (part.get('order_type') === 0) && 'w48pr', (part.get('order_type') === 1) && 'w100pr', (part.get('order_type') === 2) && 'd-N' )}

                >
                  <span className="w100pr ta-C">
                    <span className="va-m ta-C"><i className="flaticon-phone c-as fs16" /></span>
                    <span className='M-d-n-1420 va-m'>Телефон</span>
                  </span>
                </button>
                <button
                  onClick={this.onShowOrderPopup.bind(null, currentIndex, part.get('user_id'))}
                  className={cx('p8 br2 grad-w b0 btn-shad-b ta-C', (part.get('order_type') === 0) && 'w48pr', (part.get('order_type') === 2) && 'w100pr', (part.get('order_type') === 1) && 'd-N' )}
                >
                  <i className="flaticon-mail c-as fs16 mR5"></i>
                  <span className='M-d-n-1420'>Заявка</span>
                </button>
              </div>
            </td>
          </tr>
        )
      }
    ).toJS();

    //page_num
    //items_per_page
    //results_count
    const ItemsPerPage = kITEMS_PER_PAGE.map((item, index) => (
      <a
        key={index}
        onClick={this.props.onItemPerPageChange.bind(null, item)}
        className={cx('bc-g cur-p', cx(item === this.props.itemPerPage && 'active'))}
      >
        {item}
      </a>
    ));
    if (!arrayCompare(companyIds, this.companyIds)) {
      statisticsActions.setStatistics('as', 'show', companyIds);
      this.companyIds = companyIds;
    }
    return (
      <div className={this.props.className}>

        <div className="entire-width flex-ai-fe">
          <div className='fs14 bgc-yellow-600 d-ib p5-15 bTRr8'>Не нашли деталь?
            <strong> Позвоните мастеру</strong>
            <i className='icon_free fs22 va-M mL10'></i>
          </div>
            {(this.props.autoServicesResults.size > 0) &&
            <div className="m20">
              <span className='mR15'>Показывать по</span>
              <span className="show-by border-between-h bc-g">
                  {ItemsPerPage}
              </span>
            </div>
              }
        </div>

        <table cellSpacing="0" className="search-table">
          <thead>
            <tr className='bg-c-gl ta-L'>
              <th className='w40px'>
                <i className='icon_placemark-grey'></i>
              </th>
              <th>Компания</th>
              <th>Марки</th>
              <th className='w55px ta-C'>
                <i className='icon_door fs22' title='Кузовные работы'></i>
              </th>
              <th className='w55px ta-C'>
                <i className='icon_axis fs22' title='Слесарные работы'></i>
              </th>
              <th className='w55px ta-C'>
                <i className='icon_to fs22' title='ТО'></i>
              </th>
              <th className='w55px ta-C'>
                <i className='icon_more fs22 va-M' title='Тюнинг и прочее'></i>
              </th>
              <th  className='ta-C w95px bgc-yellow-600'>Имя мастера</th>
              <th className='ta-C w210px'>
                <label className="label--checkbox">
                  <input
                    type="checkbox"
                    checked={this.props.showAllPhone}
                    disabled={this.props.showAllPhone}
                    onChange={this.onShowAllPhoneChange.bind(null, 'autoservices')}
                    className="checkbox"
                  />
                  <span className='m0-5'>Показать телефоны</span>
                </label>
              </th>
            </tr>
          </thead>

          <tbody>
                {TrMarkers}
          </tbody>
        </table>

        <div className="ta-R m20">
          <Pager className="pagination fs14"
            page_num={this.props.currentPage - 1}
            items_per_page={this.props.itemPerPage}
            results_count={this.props.autoServicesResults.size}
            pages_on_screen={kPAGES_ON_SCREEN}
            on_click={this.onCurrentPageChange}/>

        </div>
        <Order type={2} item={this.props.autoServicesResults.get(this.props.currentOrderItem)} onClickCloseModal={this.onClickCloseModal}/>
      </div>
    );
    /* jshint ignore:end */
  }
}


