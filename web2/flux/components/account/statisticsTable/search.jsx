'use strict';

var _ = require('underscore');
var React = require('react/addons');

var sc = require('shared_constants');
var immutable = require('immutable');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Typeahead = require('components/typeahead/typeahead.jsx');
var Pager = require('components/pager/pager.jsx');
/* jshint ignore:end */

var catalog_actions = require('actions/catalog_actions.js');
var catalog_data_actions = require('actions/catalog_data_actions.js');

var catalog_suggestion_store = require('stores/catalog_suggestion_store.js');
var catalog_data_store = require('stores/catalog_data_store.js');
var toggle_actions = require('actions/ToggleActions.js');
var toggle_store = require('stores/ToggleStore.js');
var cx        = require('classnames');
import catalogDataActionNew from 'actions/catalog_data_actions_new.js';

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    brands         : catalog_suggestion_store.get_brands(),
    brand_tags     : catalog_suggestion_store.get_brand_tags(),
    services       : catalog_suggestion_store.get_services(),
    service_tags   : catalog_suggestion_store.get_service_tags(),
    show_value_hack: catalog_suggestion_store.get_show_value(),
    company_type   : catalog_suggestion_store.get_company_type(),
    company_type_price   : catalog_suggestion_store.get_company_type_price(),
    toggle         : toggle_store.getToggle(),
    items_per_page: catalog_data_store.get_items_per_page(),
}),
catalog_suggestion_store, catalog_data_store, toggle_store /*observable store list*/);


var kITEMS_PER_PAGE = sc.kITEMS_PER_PAGE;
var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...
var kORGANIZATION_TYPES = sc.kORGANIZATION_TYPES;
var kORGANIZATION_PRICE_TYPES = sc.kORGANIZATION_PRICE_TYPES;

var CatalogSearch = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  componentWillMount() {
    
  },
  
  typeahead_brands_changed (v) {    
    if(!this.state.brand_tags.find(b => b.get('id') === v.id)) {    
      var brand_tag_ids = this.state.brand_tags.push(immutable.fromJS(v)).map(b => b.get('id')).toJS();
      var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();
    
      catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids,this.state.company_type_price.get('id'));
    }
  },

  typeahead_service_changed (v) {
    if(!this.state.service_tags.find(s => s.get('id') === v.id)) {    
      var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
      var service_tags_ids = this.state.service_tags.push(immutable.fromJS(v)).map(s => s.get('id')).toJS();
    
      catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids,this.state.company_type_price.get('id'));
    }
  },

  typeahead_lost_focus () { //означает что тайпахед закрылся
    //console.log('typeahead lost focus');
  },

  on_remove_tag(id, e) {
    var brand_tag_ids = this.state.brand_tags.filter(b => b.get('id')!==id).map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();
    
    catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids,this.state.company_type_price.get('id'));

    e.preventDefault();
    e.stopPropagation();
  },

  on_remove_service_tag(id, e) {    
    var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.filter(s => s.get('id')!==id).map(s => s.get('id')).toJS();
    
    catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids,this.state.company_type_price.get('id'));

    e.preventDefault();
    e.stopPropagation();
  },

  on_organization_type_changed(v) {
    var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();

    catalog_actions.update_page(v.id, brand_tag_ids, service_tags_ids,this.state.company_type_price.get('id'));
  },
  on_organization_type_price_changed(v) {

    var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();

      var type = (v.id == 2) ? 0 : this.state.company_type.get('id');

    catalog_actions.update_page(type, brand_tag_ids, service_tags_ids,v.id);


  },


  on_change_items_per_page (items_num, e) {
    catalog_data_actions.catalog_change_items_per_page(items_num);
    event.preventDefault();
    event.stopPropagation();
  },

  on_company_type_focus () {
    //console.log('focus');
  },


  search_all(options, searchTerm, cb) {
    cb(null, options);
  },
  search(e) {
    var text = e.target.value;
    catalogDataActionNew.search(text);
  },
  toggle(val) {
    return (e) => {
      toggle_actions.change(val);
      //для таблички чтобы она знала что размер контента изменился
      window.dispatchEvent(new Event('resize'));
    }
  },
  render () {
    return (
      <div className="catalog">
        <div className={cx('filters p0-20 bB1s bc-grey-400', !this.state.toggle.get('show_filters') ? 'd-b': 'd-N' )}>
          <div className='m10-0'>
            <div className="o-h">
              <input onChange={this.search} className="catalog-page-w100" type="text" placeholder="Введите имя компании или ..." />
            </div>
          </div>
        </div>
      </div>
    );
  }
});



module.exports = CatalogSearch;
