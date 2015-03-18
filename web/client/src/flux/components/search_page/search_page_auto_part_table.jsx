'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var sc = require('shared_constants');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');
var PointerEventDisablerMixin = require('mixins/pointer_event_disabler_mixin.js');

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


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  auto_part_results: auto_part_by_id_store.get_auto_part_results(),
  auto_part_data:    auto_part_by_id_store.get_auto_part_data_header (),
  page_num:          auto_part_by_id_store.get_page_num(),
  items_per_page:    auto_part_by_id_store.get_items_per_page(),
  results_count:     auto_part_by_id_store.get_results_count(),
  show_all_phones:   auto_part_by_id_store.get_show_all_phones(),
}),
auto_part_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');
var kITEMS_PER_PAGE = sc.kITEMS_PER_PAGE;
var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...


var SearchPageAutoPartTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin, PointerEventDisablerMixin],

  
  on_marker_click(id, e) {
    auto_part_by_id_actions.close_all_and_open_balloon(id);
    e.preventDefault();
    e.stopPropagation();
  },

  on_hover(id, hover_state) {
    auto_part_by_id_actions.auto_part_marker_hover(id, hover_state, {update_same_address: false});
  },

  on_show_phone (id) {
    auto_part_by_id_actions.auto_part_show_phone(id);
  },  
  //TODO добавить и написать миксин который будет дизейблить поинтер евенты  
  on_change_items_per_page (items_num, e) {
    auto_part_by_id_actions.auto_part_change_items_per_page(items_num);
    event.preventDefault();
    event.stopPropagation();
  },

  on_page_click (page_num) {
    auto_part_by_id_actions.auto_part_change_page(page_num);
  },

  on_show_all_phones_on_current_page (e) {
    auto_part_by_id_actions.auto_part_show_all_phones_on_current_page(e.target.checked);
  },

  on_show_price_tootip(id, tooltip_type, e) {
    console.log('on_show_price_tootip', id);
    fixed_tooltip_actions.show_fixed_tooltip(id, tooltip_type);
    e.preventDefault();
    e.stopPropagation();
  },

  

  on_goto_find(id, auto_part_initial_value, e) {
    auto_part_search_actions.show_value_changed(auto_part_initial_value);
    e.preventDefault();
    e.stopPropagation();    
  },

  render () {
    /* jshint ignore:start */
    //is_hovered
    
    var auto_part_initial_value = this.state.auto_part_data ? this.state.auto_part_data.get('name') : '';

    var page_num = this.state.page_num;
    var results_count = this.state.results_count;
    var items_per_page = this.state.items_per_page;

    var items_from = items_per_page*page_num;
    var items_to =   items_per_page*(page_num + 1);


    var TrMarkers  = this.state.auto_part_results && 
    this.state.auto_part_results
    //.filter((part, part_index) => part_index >= items_from && part_index < items_to)
    .filter(part => part.get('on_current_page'))
    .map((part, part_index) => {
      
      var hover_class = cx({
        hovered_same_rank: part.get('is_hovered_same_rank'), //это значит кто то в табличке или на карте навелся на ранк X
        hovered_same_address: part.get('is_hovered_same_address'),
        balloon_visible_same_rank: part.get('is_balloon_visible_same_rank'),
        balloon_visible_same_address: part.get('is_balloon_visible_same_address')
      });

      var stock_class_name = {};
      /*1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"*/
      var kSTOCK_ICONS     = ['', 'icon_box-check',     'icon_car', 'icon_car', 'icon_car', 'icon_car', 'icon_car', 'icon_car'];
      var kSTOCK_ICONS_ADD = ['stock_empty', 'stock_empty', 'stock-2',    'stock-7',   'stock-14',  'stock-31',     'stock_empty',  'stock_empty'];
      stock_class_name[kSTOCK_ICONS[part.get('stock')]] = true;
      stock_class_name[kSTOCK_ICONS_ADD[part.get('stock')]] = true;




      /*m.get('balloon_visible').toString()*/
      return (
        <tr className={(part_index%2 > 0) && 't-bg-c-g'} onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
            onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)}
            key={part.get('id')}>
          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autopart-table-td-rank', hover_class) }>
            <span className='nap'>{part.get('rank')}</span>
          </td>

          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className=''>

            <div className="lh1-4 ellipsis">{part.get('main_marker').get('company_name')}</div>
            <div className='ellipsis'>
              <span
                onClick={part.get('markers').filter( m => m.get('visible') ).size>1 ?
                  _.bind(this.on_show_price_tootip, this, part.get('id'), 'autopart-tooltip-adresses') :
                  _.bind(this.on_marker_click, this, part.get('main_marker').get('id'))
                }
                className="bb-d c-g cur-p lh1-4">

                {part.get('main_marker').get('address')}

              </span>
            </div>
            <div className="f-R">
            <FixedTooltip 
              open_id={part.get('id')}
              open_type={'autopart-tooltip-adresses'} 
              >
                
              <strong className='fs12'>Все адреса</strong>
              
              <div className="search-page-auto-part-table-body-work-tooltip-list fs12">
                {part.get('markers').filter( m => m.get('visible') ).map( (m, index) => 
                  <div 
                    onMouseEnter={_.bind(this.on_hover, this,  m.get('id'), true)}
                    onMouseLeave={_.bind(this.on_hover, this,  m.get('id'), false)}
                    onClick={_.bind(this.on_marker_click, this, m.get('id'))}
                    className="search-page-auto-part-table-body-work-tooltip-list-address" key={index} >
                    <span className='c-p bb-d cur-p'>{m.get('address')}</span>
                  </div> ).toJS()}
              </div>
            </FixedTooltip>
            </div>
          </td>

          <td className="search-page-autopart-table-td-manufacturer-code">
            <div className="lh1-4 fw-b ellipsis">{part.get('manufacturer')}</div>
            <div className="c-g">{part.get('code')}</div>
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

                <div onClick={_.bind(this.on_goto_find, this, part.get('id'), auto_part_initial_value)}
                  className="c-p">
                  <i className='svg-icon_gear fs32 f-L mR10'></i>
                  <span className='bB1d cur-p'>
                    Ищете конкретную деталь? <br/>
                    Наберите ее в поиске
                  </span>
                </div>
              </FixedTooltip>
            </div>
          </td>
          <td className='ta-c'>
            <span className={cx('fs25 va-m m0-5', cx(part.get('used') ? 'svg-icon_no-use' : 'svg-icon_use'))}></span>
            <span className={cx('fs23 va-m m0-5', cx(stock_class_name))}></span>
            {/*1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"*/}
          </td>
          <td className={cx('', cx((part_index%2 > 0) ? 't-bg-c-ap-m' : 't-bg-c-ap-l'))}>
            <div className="fs18 fw-b m0-5 lh1 M-fs14-1200">{part.get('retail_price')} <span className='M-d-n-1200'> р.</span></div>
            <div className="">
              <div className='fs11 c-p bb-d cur-p m0-5' onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autopart-tooltip-price')}>
                условия <span className='M-d-n-1200'> оплаты</span>
              </div>
              <div className='f-R'>
                <FixedTooltip className="search-page-autopart-table-price-link-tooltip" open_id={part.get('id')} open_type={'autopart-tooltip-price'}>
                  <div className='fs14 mB10 mR20 fw-b'>Условия оплаты</div>
                  <div>{part.has('retail_price') && 'Розничная цена.'}</div>
                  <div>{part.has('price_if_our_service') && 'Действительна при установке на нашем сервис центре.'}</div>
                  <div>{part.has('delivery_free_msk') && 'Бесплатная доставка по МСК.'}</div>
                  <div>{part.has('delivery_free_spb') && 'Бесплатная доставка по СПб.'}</div>
                  <div>{part.has('price_only_for_legal_person') && 'Только для юр.лиц'}</div>
                  <div>{part.has('price_above_level_0') && 'Цена покупки от 20 000 р'}</div>
                  <div>{part.has('price_above_level_1') && 'Цена покупки от 40 000 р'}</div>
                </FixedTooltip>
              </div>
            </div>
            
          </td>
          <td className="search-page-autopart-table-td-phone search-page-autopart-table-td-multiple-btn">
            
            <div style={ { display: this.state.show_all_phones || part.get('main_marker').get('show_phone') ? 'block': 'none' } }
              className="ta-c fs20">
              <span className='fs14'>{part.get('main_marker').get('main_phone').substr(0,7)}</span>
            {part.get('main_marker').get('main_phone').substr(7)}
            </div>
            
            <div className='entire-width' style={ { display: this.state.show_all_phones || part.get('main_marker').get('show_phone') ? 'none' : 'flex' } }>

                <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                      className="p8 br2 grad-w b0 btn-shad-b w48pr ta-c">
                  <i className="flaticon-phone c-ap fs16"></i>
                  <span className='M-d-n-1420'>Телефон</span>
                </button>


              <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                    className="p8 br2 grad-w b0 btn-shad-b w48pr ta-c">
                <i className="flaticon-mail c-ap fs16"></i>
                <span  className='M-d-n-1420'>Заявка</span>
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
    var ItemsPerPage = _.map(kITEMS_PER_PAGE, item_per_page => 
      <a  key={item_per_page} 
        className={cx('bc-g cur-p', cx(item_per_page===this.state.items_per_page ? 'active' : ''))}

          onClick={_.bind(this.on_change_items_per_page, this, item_per_page)} >
            {item_per_page}
      </a>);

console.log(this.state.show_all_phones);
    return (
      <div className={this.props.className}>
        <div className="entire-width flex-ai-c m20-0 h30px">
            <div className="m0-10 fs18">
                <span>Найдено </span>
                <strong className='c-ap'> {this.state.results_count} </strong>
                <span>{['предложение', 'предложения', 'предложений'][text_utils.decl_num(this.state.results_count)]}</span>
            </div>
            {(this.state.results_count > 0) &&
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
                  <tr className='bg-c-gl ta-l'>
                      <th className='w40px'><i className='icon_placemark-grey'></i></th>
                      <th className=''>Продавец</th>
                      <th className='w170px'>Производитель / Артикул</th>
                      <th className=''>Описание детали</th>
                      <th className='ta-c w90px'>Инфо</th>
                      <th className='ta-c c-wh w110px t-bg-c-ap'>Цена</th>
                      <th className='ta-c w210px'>
                        <label className="label--checkbox">
                          <input type="checkbox" checked={this.state.show_all_phones} onChange={this.on_show_all_phones_on_current_page} className="checkbox"/>
                          <span className='m0-5'>Показать телефоны</span>
                        </label>
                      </th>
                  </tr>
              </thead>

              <tbody>
                {TrMarkers}
              </tbody>
          </table>

        <div className="ta-r m20">
          <Pager  className="pagination fs14"
            page_num={this.state.page_num}
            items_per_page={this.state.items_per_page}
            results_count={this.state.results_count}
            pages_on_screen={kPAGES_ON_SCREEN}
            on_click={this.on_page_click}/>

        </div>
      



      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = SearchPageAutoPartTable;
