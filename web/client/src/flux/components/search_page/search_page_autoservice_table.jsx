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
var FixedTooltip = require('components/tooltip/fixed_tooltip.jsx');
/* jshint ignore:end */

var autoservice_by_id_store = require('stores/autoservice_by_id_store.js');

var test_action = require('actions/test_action.js');
var autoservice_by_id_actions = require('actions/autoservice_by_id_actions.js');
var autoservices_search_actions = require('actions/autoservices_search_actions.js');

var fixed_tooltip_actions = require('actions/fixed_tooltip_actions.js');



var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  autoservice_results: autoservice_by_id_store.get_autoservice_results(),
  autoservice_data: autoservice_by_id_store.get_autoservice_data_header (),
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

  
  on_marker_click(id, e) {
    autoservice_by_id_actions.close_all_and_open_balloon(id);
    e.preventDefault();
    e.stopPropagation();
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
  
  on_show_price_tootip(id, tooltip_type, e) {
    fixed_tooltip_actions.show_fixed_tooltip(id, tooltip_type);
    e.preventDefault();
    e.stopPropagation();
  },

  on_goto_find(id, autoservice_initial_value, e) {
    autoservices_search_actions.show_value_changed(autoservice_initial_value);
    e.preventDefault();
    e.stopPropagation();  
  },

  render () {
    /* jshint ignore:start */
    //is_hovered
    var autoservice_initial_value = this.state.autoservice_data ? this.state.autoservice_data.get('service') : '';
    
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
      
      var kBODY_WORK_KEY = 'Кузовные работы';
      var kMETAL_WORK_KEY = 'Слесарные работы';
      var kTO_WORK_KEY = 'ТО';
      var kTUNING = 'Тюнинг и прочее';

      var body_list = part.get('services').get(kBODY_WORK_KEY) && part.get('services').get(kBODY_WORK_KEY).get('list') &&
        part.get('services').get(kBODY_WORK_KEY).get('list').map( (l, index) => {
          return <div key={index}>{l}</div>;
        }).toArray();

      var metal_list = part.get('services').get(kMETAL_WORK_KEY) && part.get('services').get(kMETAL_WORK_KEY).get('list') &&
        part.get('services').get(kMETAL_WORK_KEY).get('list').map( (l, index) => {
          return <div key={index}>{l}</div>;
        }).toArray();

      var to_list = part.get('services').get(kTO_WORK_KEY) && part.get('services').get(kTO_WORK_KEY).get('list') &&
        part.get('services').get(kTO_WORK_KEY).get('list').map( (l, index) => {
          return <div key={index}>{l}</div>;
        }).toArray();

        var tuning_list = part.get('services').get(kTUNING) && part.get('services').get(kTO_WORK_KEY).get('list') &&
          part.get('services').get(kTUNING).get('list').map( (l, index) => {
            return <div key={index}>{l}</div>;
          }).toArray();

      //console.log('brands', typeof(body_list));

      /*m.get('balloon_visible').toString()*/
      return (
        <tr onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
            onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)}
            key={part.get('id')}>
          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autoservice-table-td-rank', hover_class) }>
            <span className='nas'>{part.get('rank')}</span>
          </td>

          <td onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
              className={cx('search-page-autoservice-table-td-seller', 'tooltip', hover_class)}>

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

            <FixedTooltip 
              open_id={part.get('id')}
              open_type={'autoservice-tooltip-adresses'} 
              className="search-page-autoservice-table-body-work-tooltip">
                
              <strong>Все адреса</strong>
              
              <div className="search-page-autoservice-table-body-work-tooltip-list">
                {part.get('markers').filter( m => m.get('visible') ).map( (m, index) => 
                  <div 
                    onMouseEnter={_.bind(this.on_hover, this,  m.get('id'), true)}
                    onMouseLeave={_.bind(this.on_hover, this,  m.get('id'), false)}
                    onClick={_.bind(this.on_marker_click, this, m.get('id'))}
                    className="search-page-autoservice-table-body-work-tooltip-list-address" key={index} >
                    {m.get('address')}
                  </div> ).toJS()}
              </div>

              <hr/>
                
                <div className="search-page-autoservice-table-body-work-tooltip-address-message">
                  <div>Ищете место рядом?</div>
                  <div>Используйте карту чтобы найти</div>
                </div>              
            </FixedTooltip>


          </td>

          <td className="search-page-autoservice-table-td-auto-marks">            
            <div 
              className="cur-p c-yellow-800"
              onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-auto-marks')} >
              {brands}
            </div> 

            <FixedTooltip 
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-auto-marks'} 
                className="ta-l">
                
                <strong className='fs14 mB10 d-ib'>Марки</strong>
                <div className="search-page-autoservice-table-body-work-tooltip-list">
                  {brands}
                </div>
                
                <hr className='hr'/>
                

              <div onClick={_.bind(this.on_goto_find, this, part.get('id'), autoservice_initial_value)}
                className="c-yellow-800">
                <i className='icon_key fs32 f-L mR10'></i>
                <span className='bB1d cur-p'>
                  Ищете конкретную марку?<br/>
                  Наберите ее в поиске
                </span>
              </div>
            </FixedTooltip>

          </td>

          <td className="ta-c">
            <span
              className="cur-p bB1d c-yellow-800"
              onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-body-work')} >
              {part.get('services').get(kBODY_WORK_KEY) && (part.get('services').get(kBODY_WORK_KEY).get('count').get('in')+' / ' +
              part.get('services').get(kBODY_WORK_KEY).get('count').get('all'))}
            </span>
            {/*код тултипа*/}  
            <FixedTooltip 
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-body-work'} 
                className="ta-l">
                
                <strong className='fs14 mB10 d-ib'>Кузовные работы</strong>
                <div className="Mh150px o-a mR-8">
                  {body_list}
                </div>
                
                <hr className='hr'/>

              <div onClick={_.bind(this.on_goto_find, this, part.get('id'), autoservice_initial_value)}
                className="c-yellow-800">
                <i className='icon_key fs32 f-L mR10'></i>
                <span className='bB1d cur-p'>
                  Ищете конкретный вид работ?<br/>
                  Наберите его в поиске
                </span>
              </div>
            </FixedTooltip>
          </td>

          <td className="ta-c">
            <span
              className="cur-p bB1d c-yellow-800"
              onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-metal-work')} >
              {part.get('services').get(kMETAL_WORK_KEY) && (part.get('services').get(kMETAL_WORK_KEY).get('count').get('in')+' / ' +
              part.get('services').get(kMETAL_WORK_KEY).get('count').get('all'))}
            </span>

            {/*код тултипа*/}  
            <FixedTooltip 
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-metal-work'} 
                className="ta-l">
                
                <strong className='fs14 mB10 d-ib'>Слесарные работы</strong>
              <div className="Mh150px o-a mR-8">
                  {metal_list}
                </div>
                
                <hr className='hr'/>

              <div onClick={_.bind(this.on_goto_find, this, part.get('id'), autoservice_initial_value)}
                className="c-yellow-800">
                <i className='icon_key fs32 f-L mR10'></i>
                <span className='bB1d cur-p'>
                  Ищете конкретный вид работ?<br/>
                  Наберите его в поиске
                </span>
              </div>
            </FixedTooltip>
            

          </td>

          <td className="ta-c">
            <span
              className="cur-p bB1d c-yellow-800"
              onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-to-work')} >
              {part.get('services').get(kTO_WORK_KEY) && (part.get('services').get(kTO_WORK_KEY).get('count').get('in')+' / ' +
              part.get('services').get(kTO_WORK_KEY).get('count').get('all'))}            
            </span>
            {/*код тултипа*/}  
            <FixedTooltip 
                open_id={part.get('id')}
                open_type={'autoservice-tooltip-to-work'}
                className="ta-l">
                
                <strong className='fs14 mB10 d-ib'>ТО</strong>
              <div className="Mh150px o-a mR-8">
                  {to_list}
                </div>
                
                <hr className='hr'/>

              <div onClick={_.bind(this.on_goto_find, this, part.get('id'), autoservice_initial_value)}
                className="c-yellow-800">
                <i className='icon_key fs32 f-L mR10'></i>
                <span className='bB1d cur-p'>
                  Ищете конкретный вид работ?<br/>
                  Наберите его в поиске
                </span>
              </div>
            </FixedTooltip>
          </td>


          <td className="ta-c">
            <span
              className="cur-p bB1d c-yellow-800"
              onClick={_.bind(this.on_show_price_tootip, this, part.get('id'), 'autoservice-tooltip-to-work1')} >
              {part.get('services').get(kTUNING) && (part.get('services').get(kTUNING).get('count').get('in')+' / ' +
              part.get('services').get(kTUNING).get('count').get('all'))}
            </span>
            {/*код тултипа*/}
            <FixedTooltip
              open_id={part.get('id')}
              open_type={'autoservice-tooltip-to-work1'}
              className="ta-l">

              <strong className='fs14 mB10'>Тюнинг и прочее</strong>
              <div className="Mh150px o-a mR-8">
                  {tuning_list}
              </div>

              <hr className='hr'/>

              <div onClick={_.bind(this.on_goto_find, this, part.get('id'), autoservice_initial_value)}
                className="c-yellow-800">
                <i className='icon_key fs32 f-L mR10'></i>
                <span className='bB1d cur-p'>
                  Ищете конкретный вид работ?<br/>
                  Наберите его в поиске
                </span>
              </div>
            </FixedTooltip>
          </td>

          <td className={cx('', cx((part_index%2 > 0) ? 'bgc-yellow-200' : 'bgc-yellow-100'))}>
            <div className="fw-b fs14">{part.get('masters_name').first()}</div>
            <div className="c-yellow-800 d-ib fs12">{part.get('site')}</div>
          </td>

          <td className="search-page-autoservice-table-td-phone search-page-autoservice-table-td-multiple-btn">
            <div style={ { display: this.state.show_all_phones || part.get('main_marker').get('show_phone') ? 'block': 'none' } }
              className="ta-c fs20">
              <span className='fs14'>{part.get('main_marker').get('main_phone').substr(0,7)}</span>
            {part.get('main_marker').get('main_phone').substr(7)}
            </div>

            <div className='entire-width' style={ { display: this.state.show_all_phones || part.get('main_marker').get('show_phone') ? 'none' : 'flex' } }>

              <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
                className="p8 br2 grad-w b0 btn-shad-b w100pr ta-c">
                <i className="flaticon-phone c-as fs16"></i>
                <span className='M-d-n-1420'>Телефон</span>
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


    return (
      <div className={this.props.className}>
        <div className="entire-width flex-ai-fe">
          <div className='fs14 bgc-yellow-600 d-ib p5-15 bTRr8'>Не нашли деталь ? <strong>Позвоните мастеру</strong>
            <i className='icon_free fs22 va-m mL10'></i>
          </div>
            {(this.state.results_count > 0) &&
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
                <tr className='bg-c-gl ta-l'>
                  <th className='w40px'>
                    <i className='icon_placemark-grey'></i>
                  </th>
                  <th>Компания</th>
                  <th>Марки</th>
                  <th className='w55px ta-c'><i className='icon_door fs22' title='Кузовные работы'></i></th>
                  <th className='w55px ta-c'><i className='icon_axis fs22' title='Слесарные работы'></i></th>
                  <th className='w55px ta-c'><i className='icon_to fs22' title='ТО'></i></th>
                  <th className='w55px ta-c'><i className='icon_more fs22 va-m' title='Тюнинг и прочее'></i></th>
                  <th  className='ta-c w110px bgc-yellow-600'>Имя мастера</th>
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

module.exports = SearchPageAutoServiceTable;
