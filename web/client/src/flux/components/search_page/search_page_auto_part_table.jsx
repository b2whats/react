'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');
var PointerEventDisablerMixin = require('mixins/pointer_event_disabler_mixin.js');

var point_utils = require('utils/point_utils.js');
var text_utils = require('utils/text.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Pager = require('components/pager/pager.jsx');
/* jshint ignore:end */

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');




var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  auto_part_results: auto_part_by_id_store.get_auto_part_results(),
  page_num:          auto_part_by_id_store.get_page_num(),
  items_per_page:    auto_part_by_id_store.get_items_per_page(),
  results_count:     auto_part_by_id_store.get_results_count(),
  show_all_phones:   auto_part_by_id_store.get_show_all_phones(),
}),
auto_part_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');
var kITEMS_PER_PAGE = [1,2,5,10,15,20];
var kPAGES_ON_SCREEN = 3; //сколько циферок показывать прежде чем показать ...


var SearchPageAutoPartTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin, PointerEventDisablerMixin],

  
  on_marker_click(id) {
    auto_part_by_id_actions.close_all_and_open_balloon(id);
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

  render () {
    /* jshint ignore:start */
    //is_hovered
    
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
      var kSTOCK_ICONS     = ['', 'svg-icon_box-check',     'svg-icon_car', 'svg-icon_car', 'svg-icon_car', 'svg-icon_car', 'svg-icon_car', 'svg-icon_car'];
      var kSTOCK_ICONS_ADD = ['stock_empty', 'stock_empty', 'stock-2-7',    'stock-7-14',   'stock-14-21',  'stock-31',     'stock_empty',  'stock_empty'];
      stock_class_name[kSTOCK_ICONS[part.get('stock')]] = true;
      stock_class_name[kSTOCK_ICONS_ADD[part.get('stock')]] = true;


      /*m.get('balloon_visible').toString()*/
      return (
        <tr onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
            onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)}
            key={part.get('id')}>
          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autopart-table-td-rank', hover_class) }>
            <span className="search-page-autopart-table-rank">{part.get('rank')}</span>
          </td>

          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autopart-table-td-seller', 'tooltip', hover_class)}>

            <div className="search-page-autopart-table-company-name">{part.get('main_marker').get('company_name')}</div>
            <div className="search-page-autopart-table-company-address">
              {part.get('main_marker').get('address')}
              {/* part_index == 0 ? (
              <span className="tooltip-content">
                <strong>От программиста</strong><br />
                если наводимся на row то метка подсвечивается на карте,
                если наводимся на метку на карте то подсвечиваем всех с таким же номером в первой колонке, если кликаем то по другому подсвечиваем,
                а адрес если совпадает выделяем зеленым, наиболее хорошо это видно в Питере если искать volkswagen 5c5845011qnvb,
                там у одной пятерки совпадает номер а у другой и номер и адрес 
              </span> ) : '' */}

            </div>

          </td>

          <td className="search-page-autopart-table-td-manufacturer-code">
            <div className="search-page-autopart-table-manufacturer">{part.get('manufacturer')}</div> 
            <div className="search-page-autopart-table-code">{part.get('code')}</div> 
          </td>

          <td className="search-page-autopart-table-td-part-description tooltip">
            <div className="search-page-autopart-table-part-description">
              {part.get('name')} &nbsp;
              {/* part_index == 0 ? (
              <span className="tooltip-content">
                <strong>От программиста</strong><br />
                Что то я не очень соображаю<br/> куда эта ссылка
              </span>) : '' */}
            
            </div>
          </td>
          <td className="search-page-autopart-table-td-info tooltip">
            <span className={cx('search-page-autopart-table-info-used', cx(part.get('used') ? 'svg-icon_use' : 'svg-icon_no-use' ))}></span>
            <span className={cx('search-page-autopart-table-info-stock', cx(stock_class_name))}></span>
            {/*1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"*/}
          </td>
          <td className="search-page-autopart-table-td-price tooltip">
            <div className="search-page-autopart-table-price">{part.get('retail_price')}</div>
            <div className="search-page-autopart-table-price-link">условия оплаты</div>
              {/* part_index == 0 ? (
              <span className="tooltip-content" style={ {width: '160px', 'marginTop': '-16px', 'marginLeft':'100px'} }>
                <strong>От программиста</strong><br />
                условия куда ведут?
              </span>) : ''*/}
            
          </td>
          <td className="search-page-autopart-table-td-phone search-page-autopart-table-td-multiple-btn">
            { part.get('main_marker').get('show_phone') ? 
            <div className="search-page-autopart-table-phone">{part.get('main_marker').get('phone')}</div> :
           (<div className="wrap gutter-2-xs">
              <div className="md-12-6">
                <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                      className="search-page-autopart-table-phone-button btn-with-icon">
                  <i className="svg-icon_phone btn-svg-icon"></i>              
                  <span>Телефон</span>
                </button>
              </div>
              <div className="md-12-6">
              <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                    className="search-page-autopart-table-phone-button btn-with-icon">
                <i className="svg-icon_mail btn-svg-icon"></i>              
                <span>Заявка</span>
              </button>
              </div>
            </div>
            ) }
          
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
          href=""
          className={item_per_page===this.state.items_per_page ? 'active' : null}
          onClick={_.bind(this.on_change_items_per_page, this, item_per_page)} >
            {item_per_page}
      </a>);


    return (
      <div className={this.props.className}>
        <div className="search-page-container search-page-container-side-margin">
          <div className="wrap gutter-5-xs">
            <div className="md-12-6 left-md search-page-info-header">              
                <span>Найдено</span>&nbsp;
                <strong>{this.state.results_count}</strong>&nbsp;
                <span>{['предложение', 'предложения', 'предложений'][text_utils.decl_num(this.state.results_count)]}</span>
            </div>
            
            <div className="md-12-6 right-md search-page-info-header">              
                <span>Показывать по</span>
                <span className="pager-buttons">
                  {ItemsPerPage}
                </span>              
            </div>
          </div>
        </div>

        <div className="search-page-table-border">
          <table cellSpacing="0" className="stop-events pure-table pure-table-striped search-page-autopart-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Продавец</th>
                      <th>Производитель / Артикул</th>
                      <th>Описание детали</th>
                      <th>Инфо</th>
                      <th>Цена</th>
                      <th>
                        <input checked={this.state.show_all_phones} onChange={this.on_show_all_phones_on_current_page} id="show_auto_part_phones_checkbox" type="checkbox" />
                        <label htmlFor="show_auto_part_phones_checkbox">Показать телефоны</label>
                      </th>
                  </tr>
              </thead>

              <tbody>
                {TrMarkers}
              </tbody>
          </table>
        </div>      
      
        <div className="search-page-container search-page-container-side-margin">
          <div className="wrap gutter-5-xs">
            <div className="md-12-12 right-md search-page-info-pager noselect">
              <span>Страница</span>
              <Pager  className="pager-buttons"
                      page_num={this.state.page_num}
                      items_per_page={this.state.items_per_page}
                      results_count={this.state.results_count} 
                      pages_on_screen={kPAGES_ON_SCREEN} 
                      on_click={this.on_page_click}/>
            </div>
          </div>
        </div>
      



      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = SearchPageAutoPartTable;
