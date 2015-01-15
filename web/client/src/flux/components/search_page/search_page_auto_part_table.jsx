'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var auto_part_by_id_store = require('stores/auto_part_by_id_store.js');

var test_action = require('actions/test_action.js');
var auto_part_by_id_actions = require('actions/auto_part_by_id_actions.js');


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  //auto_part_markers: auto_part_by_id_store.get_auto_part_markers(),
  auto_part_results: auto_part_by_id_store.get_auto_part_results()
}),
auto_part_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');


var SearchPageAutoPartTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],
  
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

  render () {
    /* jshint ignore:start */
    //is_hovered
    
    var TrMarkers  = this.state.auto_part_results && this.state.auto_part_results.map((part, part_index) => {
      
      var hover_class = cx({
        hovered_same_rank: part.get('is_hovered_same_rank'), //это значит кто то в табличке или на карте навелся на ранк X
        hovered_same_address: part.get('is_hovered_same_address'),
        balloon_visible_same_rank: part.get('is_balloon_visible_same_rank'),
        balloon_visible_same_address: part.get('is_balloon_visible_same_address')
      });

      var stock_class_name = {};
      stock_class_name['stock-num-'+part.get('stock')] = true;


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
              { part_index == 0 ? (
              <span className="tooltip-content">
                <strong>От программиста</strong><br />
                если наводимся на row то метка подсвечивается на карте,
                если наводимся на метку на карте то подсвечиваем всех с таким же номером в первой колонке, если кликаем то по другому подсвечиваем,
                а адрес если совпадает выделяем зеленым, наиболее хорошо это видно в Питере если искать volkswagen 5c5845011qnvb,
                там у одной пятерки совпадает номер а у другой и номер и адрес 
              </span> ) : ''}

            </div>

          </td>

          <td className="search-page-autopart-table-td-manufacturer-code">
            <div className="search-page-autopart-table-manufacturer">{part.get('manufacturer')}</div> 
            <div className="search-page-autopart-table-code">{part.get('code')}</div> 
          </td>

          <td className="search-page-autopart-table-td-part-description tooltip">
            <div className="search-page-autopart-table-part-description">
              {part.get('name')}
              { part_index == 0 ? (
              <span className="tooltip-content">
                <strong>От программиста</strong><br />
                Что то я не очень соображаю<br/> куда эта ссылка
              </span>) : ''}
            
            </div>
          </td>
          <td className="search-page-autopart-table-td-info tooltip">
            <span className={cx('search-page-autopart-table-info-used', cx({is_used: part.get('used')}))}></span>
            <span className={cx('search-page-autopart-table-info-stock', cx(stock_class_name))}></span>
              { part_index == 0 ? (
              <span className="tooltip-content" style={ {width: '200px', 'marginTop': '7px', 'marginLeft':'20px'} }>
                <strong>От программиста</strong><br />
                u - used, цифра - сток, все задано в css, надо иконки
              </span>) : ''}
          </td>
          <td className="search-page-autopart-table-td-price tooltip">
            <div className="search-page-autopart-table-price">{part.get('retail_price')}</div>
            <div className="search-page-autopart-table-price-link">условия оплаты</div>
              { part_index == 0 ? (
              <span className="tooltip-content" style={ {width: '160px', 'marginTop': '-16px', 'marginLeft':'100px'} }>
                <strong>От программиста</strong><br />
                условия куда ведут?
              </span>) : ''}
            
          </td>
          <td className="search-page-autopart-table-td-phone search-page-autopart-table-td-multiple-btn">
            { part.get('main_marker').get('show_phone') ? 
            <div className="search-page-autopart-table-phone">{part.get('main_marker').get('phone')}</div> :
           (<div className="wrap gutter-2-xs">
              <div className="md-12-6">
                <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                      className="search-page-autopart-table-phone-button btn-with-icon">
                  <i className="svg-icon_phone btn-svg-icon"></i>              
                  Телефон
                </button>
              </div>
              <div className="md-12-6">
              <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                    className="search-page-autopart-table-phone-button btn-with-icon">
                <i className="svg-icon_mail btn-svg-icon"></i>              
                Заявка
              </button>
              </div>
            </div>
            ) }
          
          </td>
        </tr>
        )
      }
    ).toJS();
    
    
    return (
      <div className={this.props.className}>
        <div className="search-page-table-border">
          <table cellSpacing="0" className="pure-table pure-table-striped search-page-autopart-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Продавец</th>
                      <th>Производитель / Артикул</th>
                      <th>Описание детали</th>
                      <th>Инфо</th>
                      <th>Цена</th>
                      <th>Телефоны</th>
                  </tr>
              </thead>

              <tbody>
                {TrMarkers}
              </tbody>
          </table>
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = SearchPageAutoPartTable;
