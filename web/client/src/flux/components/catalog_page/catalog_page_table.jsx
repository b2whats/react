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

var catalog_data_store = require('stores/catalog_data_store.js');
var catalog_data_actions = require('actions/catalog_data_actions.js');

var fixed_tooltip_actions = require('actions/fixed_tooltip_actions.js');
var region_store = require('stores/region_store.js');
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  catalog_results: catalog_data_store.get_catalog_results(),
  page_num:          catalog_data_store.get_page_num(),
  
  items_per_page:    catalog_data_store.get_items_per_page(),
  results_count:     catalog_data_store.get_results_count(),
  show_all_phones:   catalog_data_store.get_show_all_phones(),
}),
catalog_data_store /*observable store list*/);

var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...


var CatalogPageTable = React.createClass({
  propTypes: {
    className: PropTypes.string
  },

  mixins: [PureRenderMixin, RafBatchStateUpdateMixin, PointerEventDisablerMixin],

  
  on_marker_click(id, e) {
    catalog_data_actions.close_all_and_open_balloon(id);
    e.preventDefault();
    e.stopPropagation();
  },

  on_hover(id, hover_state) {
    catalog_data_actions.catalog_marker_hover(id, hover_state, {update_same_address: false});
  },

  on_show_phone (id) {
    catalog_data_actions.catalog_show_phone(id);
  },  
  //TODO добавить и написать миксин который будет дизейблить поинтер евенты  


  on_page_click (page_num) {
    catalog_data_actions.catalog_change_page(page_num);
  },

  on_show_all_phones_on_current_page (e) {
    catalog_data_actions.catalog_show_all_phones_on_current_page(e.target.checked);
  },
  
  on_show_price_tootip(id, tooltip_type, e) {
    fixed_tooltip_actions.show_fixed_tooltip(id, tooltip_type);
    e.preventDefault();
    e.stopPropagation();
  },


  render () {
    /* jshint ignore:start */
    
    var page_num = this.state.page_num;
    var results_count = this.state.results_count;
    var items_per_page = this.state.items_per_page;

    var items_from = items_per_page*page_num;
    var items_to =   items_per_page*(page_num + 1);


    var Companies  = this.state.catalog_results && 
    this.state.catalog_results
    //.filter((part, part_index) => part_index >= items_from && part_index < items_to)
    .filter(part => part.get('on_current_page'))
    .map((part, part_index) => {
      
      var hover_class = cx({
        hovered_same_rank: part.get('is_hovered_same_rank'), //это значит кто то в табличке или на карте навелся на ранк X
        hovered_same_address: part.get('is_hovered_same_address'),
        balloon_visible_same_rank: part.get('is_balloon_visible_same_rank'),
        balloon_visible_same_address: part.get('is_balloon_visible_same_address')
      });


      return (
        <tr
          className={cx(hover_class, (part_index%2 > 0) && 'bgc-grey-50', 'bT1s bc-grey-400')}
          onMouseEnter={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), true)}
          onMouseLeave={_.bind(this.on_hover,   this, part.get('main_marker').get('id'), false)}
          onClick={_.bind(this.on_marker_click, this, part.get('main_marker').get('id'))}
          key={part_index}>

          <td className='ta-C va-M w50px p0-10'>
            <i className={cx((part.get('filial_type_id') == 1) ? 'icon_placemark-ap' : 'icon_placemark-as')}></i>
            <div>
              <span  className={cx('fs12 bB1d',(part.get('filial_type_id') == 1) ? 'c-deep-purple-500' : 'c-yellow-800')}>
                {part.get('rank')}
              </span>
            </div>
          </td>
          <td className='va-M p10-0'>
            <div className='bR1s bc-grey-300 pR15'>
              <div className='entire-width mB15 flex-ai-c'>
                <Link href={'/company/'+part.get('user_id')+'/'+region_store.get_region_current().get('translit_name')} className='ap-link fs16 fw-b td-u cur-p w40pr mw200px'>{ part.get('company_name')}</Link>
                <Link href={'/company/'+part.get('user_id')+'/'+region_store.get_region_current().get('translit_name')} className='ap-link fs11 td-u'>Отзывы:
                  <span className='c-gr'> +{part.get('recommended').get('plus')} </span>/
                  <span className='c-r'> -{part.get('recommended').get('minus')}</span>
                </Link>
                <span><Link href="" target='_blank' className='td-u fs12 c-deep-purple-600 w150px d-ib ta-R ellipsis'>{part.get('site')}</Link></span>
              </div>
              <div className='fs12'>
                <div className='c-grey-600 m5-0'>Описание компании:</div>
                <span className='Mh40px d-ib o-h'>{part.get('description')}</span>
              </div>
            </div>
          </td>
          <td className='ta-C va-M w200px'>
            <div style={ { display:  part.get('main_marker').get('show_phone') ? 'block': 'none' } }
              className="ta-C fs20">
              <span className='fs14'>{!!part.get('main_marker').get('main_phone') && part.get('main_marker').get('main_phone').substr(0,7)}</span>
            {!!part.get('main_marker').get('main_phone') &&  part.get('main_marker').get('main_phone').substr(7)}
            </div>
            <button onClick={_.bind(this.on_show_phone, this, part.get('main_marker').get('id'))}
              style={ { display: part.get('main_marker').get('show_phone') ? 'none' : 'inline-block' } }
              className="p8 br2 grad-w b0 btn-shad-b ta-C">
              <i className="flaticon-phone c-deep-purple-500 fs16 mR5"></i>
              <span className=''>Показать телефон</span>
            </button>
          </td>
          
        </tr>
        )
      }
    ).toJS();
    


    return (
      <div className="catalog-page-table">
        <table className="w100pr">
          {Companies}
        </table>
      

          <div className="ta-R m20">
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

module.exports = CatalogPageTable;
