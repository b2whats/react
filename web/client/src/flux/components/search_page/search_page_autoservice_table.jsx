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

var autoservice_by_id_store = require('stores/autoservice_by_id_store.js');

var test_action = require('actions/test_action.js');
var autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');




var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  autoservice_results: autoservice_by_id_store.get_autoservice_results(),
  page_num:          autoservice_by_id_store.get_page_num(),
  items_per_page:    autoservice_by_id_store.get_items_per_page(),
  results_count:     autoservice_by_id_store.get_results_count(),
  show_all_phones:   autoservice_by_id_store.get_show_all_phones(),
}),
autoservice_by_id_store /*observable store list*/);

//var search_page_actions = require('actions/search_page_actions.js');
var kITEMS_PER_PAGE = [1,2,5,10,15,20];
var kPAGES_ON_SCREEN = 3; //сколько циферок показывать прежде чем показать ...


var SearchPageAutoServiceTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin, PointerEventDisablerMixin],

  
  on_marker_click(id) {
    autoservice_by_id_actions.close_all_and_open_balloon(id);
  },

  on_hover(id, hover_state) {
    autoservice_by_id_actions.autoservice_marker_hover(id, hover_state, {update_same_address: false});
  },

  on_show_phone (id) {
    autoservice_by_id_actions.autoservice_show_phone(id);
  },  
  //TODO добавить и написать миксин который будет дизейблить поинтер евенты  
  on_change_items_per_page (items_num, e) {
    autoservice_by_id_actions.autoservice_change_items_per_page(items_num);
    event.preventDefault();
    event.stopPropagation();
  },

  on_page_click (page_num) {
    autoservice_by_id_actions.autoservice_change_page(page_num);
  },

  on_show_all_phones_on_current_page (e) {
    autoservice_by_id_actions.autoservice_show_all_phones_on_current_page(e.target.checked);
  },


  render () {
    /* jshint ignore:start */
    //is_hovered
    
    var page_num = this.state.page_num;
    var results_count = this.state.results_count;
    var items_per_page = this.state.items_per_page;

    var items_from = items_per_page*page_num;
    var items_to =   items_per_page*(page_num + 1);


    var TrMarkers  = this.state.autoservice_results && 
    this.state.autoservice_results
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
      stock_class_name['stock-num-'+part.get('stock')] = true;

      var brands = part.get('brands') && part.get('brands').keySeq().toJS().join(', ');
      //console.log('brands',brands);

      /*m.get('balloon_visible').toString()*/
      return (
        <tr onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
            onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)}
            key={part.get('id')}>
          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autoservice-table-td-rank', hover_class) }>
            <span className="search-page-autoservice-table-rank">{part.get('rank')}</span>
          </td>

          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autoservice-table-td-seller', 'tooltip', hover_class)}>

            <div className="search-page-autoservice-table-company-name">{part.get('main_marker').get('company_name')}</div>
            <div className="search-page-autoservice-table-company-address">
              {part.get('main_marker').get('address')}
            </div>

          </td>

          <td className="search-page-autoservice-table-td-auto-marks">            
            <div className="search-page-autoservice-table-auto-marks">{brands}</div> 
          </td>

          <td className="search-page-autoservice-table-td-body-work">
            <div className="search-page-autoservice-table-body-work">
            1/10
            </div>
          </td>

          <td className="search-page-autoservice-table-td-metal-work">
            <div className="search-page-autoservice-table-metal-work">
            2/10
            </div>
          </td>

          <td className="search-page-autoservice-table-td-to-work">
            <div className="search-page-autoservice-table-td-to-work">
            1/10
            </div>
          </td>

          


          <td className="search-page-autoservice-table-td-price tooltip">
            <div className="search-page-autoservice-table-price">{part.get('master')}</div>
            <div className="search-page-autoservice-table-price-link">{part.get('site')}</div>
          </td>

          <td className="search-page-autoservice-table-td-phone search-page-autoservice-table-td-multiple-btn">
            { part.get('main_marker').get('show_phone') ? 
            <div className="search-page-autoservice-table-phone">{part.get('main_marker').get('phone')}</div> :
           (<div className="wrap gutter-2-xs">
              <div className="md-12-12">
                <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                      className="search-page-autoservice-table-phone-button btn-with-icon">
                  <i className="svg-icon_phone btn-svg-icon"></i>              
                  <span>Телефон</span>
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
        <div className="search-page-container">
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
          <table cellSpacing="0" className="stop-events pure-table pure-table-striped search-page-autoservice-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Компания</th>
                      <th>Марки</th>
                      <th>Кузовные работы</th>
                      <th>Слесарные работы</th>
                      <th>ТО</th>
                      <th>Имя мастера</th>
                      <th>
                        <input checked={this.state.show_all_phones} onChange={this.on_show_all_phones_on_current_page} id="show_autoservice_phones_checkbox" type="checkbox" />
                        <label htmlFor="show_autoservice_phones_checkbox">Показать телефоны</label>
                      </th>
                  </tr>
              </thead>

              <tbody>
                {TrMarkers}
              </tbody>
          </table>
        </div>      
      
        <div className="search-page-container">
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

module.exports = SearchPageAutoServiceTable;
