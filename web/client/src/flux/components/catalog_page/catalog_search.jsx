'use strict';

var _ = require('underscore');
var React = require('react/addons');

var sc = require('shared_constants');
var immutable = require('immutable');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Typeahead = require('components/typeahead/typeahead.jsx');
var Pager = require('components/pager/pager.jsx');
/* jshint ignore:end */

var catalog_actions = require('actions/catalog_actions.js');
var catalog_data_actions = require('actions/catalog_data_actions.js');

var catalog_suggestion_store = require('stores/catalog_suggestion_store.js');
var catalog_data_store = require('stores/catalog_data_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  brands: catalog_suggestion_store.get_brands(),
  brand_tags: catalog_suggestion_store.get_brand_tags(),
  services: catalog_suggestion_store.get_services(),
  service_tags: catalog_suggestion_store.get_service_tags(),
  show_value_hack: catalog_suggestion_store.get_show_value(),
  company_type: catalog_suggestion_store.get_company_type(),

  items_per_page: catalog_data_store.get_items_per_page(),
}),
catalog_suggestion_store, catalog_data_store /*observable store list*/);


var kITEMS_PER_PAGE = sc.kITEMS_PER_PAGE;
var kPAGES_ON_SCREEN = sc.kPAGES_ON_SCREEN; //сколько циферок показывать прежде чем показать ...
var kORGANIZATION_TYPES = sc.kORGANIZATION_TYPES;

var CatalogSearch = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  componentWillMount() {
    
  },
  
  typeahead_brands_changed (v) {    
    if(!this.state.brand_tags.find(b => b.get('id') === v.id)) {    
      var brand_tag_ids = this.state.brand_tags.push(immutable.fromJS(v)).map(b => b.get('id')).toJS();
      var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();
    
      catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids);
    }
  },

  typeahead_service_changed (v) {
    if(!this.state.service_tags.find(s => s.get('id') === v.id)) {    
      var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
      var service_tags_ids = this.state.service_tags.push(immutable.fromJS(v)).map(s => s.get('id')).toJS();
    
      catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids);
    }
  },

  typeahead_lost_focus () { //означает что тайпахед закрылся
    //console.log('typeahead lost focus');
  },

  on_remove_tag(id, e) {
    var brand_tag_ids = this.state.brand_tags.filter(b => b.get('id')!==id).map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();
    
    catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids);

    e.preventDefault();
    e.stopPropagation();
  },

  on_remove_service_tag(id, e) {    
    var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.filter(s => s.get('id')!==id).map(s => s.get('id')).toJS();
    
    catalog_actions.update_page(this.state.company_type.get('id'), brand_tag_ids, service_tags_ids);

    e.preventDefault();
    e.stopPropagation();
  },

  on_organization_type_changed(v) {
    var brand_tag_ids = this.state.brand_tags.map(b => b.get('id')).toJS();
    var service_tags_ids = this.state.service_tags.map(s => s.get('id')).toJS();

    catalog_actions.update_page(v.id, brand_tag_ids, service_tags_ids);  
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

  render () {
    var region_name = this.state.region_current && this.state.region_current.get('title');

    var style = {
      display: this.state.region_selection_visible ? 'block' : 'none'
    };
    
    var ItemsPerPage = _.map(kITEMS_PER_PAGE, item_per_page => 
      <a  key={item_per_page} 
          href=""
          className={item_per_page===this.state.items_per_page ? 'active' : null}
          onClick={_.bind(this.on_change_items_per_page, this, item_per_page)} >
            {item_per_page}
      </a>);    

    return (
      <div className="catalog">

        <div className="catalog-page-container catalog-page-container-side-margin">
          
          <div className="wrap gutter-5-xs catalog-page-mb-15">
            
            <div className="md-7-1 catalog-page-midddle catalog-page-left">
              <span>Скрыть фильтры</span>
            </div>
            
            <div className="md-7-3 catalog-page-midddle">
              <input className="catalog-page-w100" type="text" placeholder="Введите имя компании или ..." />
            </div>

            <div className="md-7-1 catalog-page-midddle">
              <Typeahead
                show_value={this.state.company_type.toJS()} 
                search={this.search_all}               
                placeholder="Тип организации" 
                has_custom_scroll={true}
                onChange={this.on_organization_type_changed} 
                options={kORGANIZATION_TYPES} />
            </div>


            <div className="md-7-2 catalog-page-midddle catalog-page-midddle catalog-page-show-pages catalog-page-ta-r">

            <div className="">
              <span className='mR15'>Показывать по</span>
              <span className="show-by border-between-h bc-g">
                  {ItemsPerPage}
              </span>
            </div>

            </div>

          </div>

          <div className="wrap gutter-5-xs catalog-page-mb-15">
            <div className="md-7-1 catalog-page-midddle catalog-page-left">
              <span>Марки</span>
            </div>
            <div className="md-7-6">  
              <div className="catalog-page-typeaged-input-emulator">                
                  <Typeahead
                    //show_value={this.state.show_value_hack.toJS()}
                    show_value={this.state.show_value_hack.toJS()}
                    placeholder="Выберите марку ..." 
                    has_custom_scroll={true} 
                    onChange={this.typeahead_brands_changed} 
                    on_blur={this.typeahead_lost_focus}
                    options={this.state.brands && this.state.brands.toJS()}>

                    {this.state.brand_tags.map(
                      (bt, index) =>
                        <div key={index} className="catalog-page-tag">
                          <span onMouseDownCapture={_.bind(this.on_remove_tag, this, bt.get('id'))} className="catalog-page-tag-close">
                            <span className="svg-icon_close"></span>
                          </span>
                          <span className="catalog-page-tag-text">{bt.get('title')}</span>
                        </div>
                    ).toJS()
                    }

                  </Typeahead>                
              </div>
            </div>
          </div>
        </div>        


        <div className="catalog-page-container catalog-page-container-side-margin">          
          <div className="wrap gutter-5-xs">
            <div className="md-7-1 catalog-page-midddle catalog-page-left">
              <span>Виды услуг</span>
            </div>
            <div className="md-7-6">  
              <div className="catalog-page-typeaged-input-emulator">
                  <Typeahead
                    //show_value={this.state.show_value_hack.toJS()}
                    show_value={this.state.show_value_hack.toJS()}
                    placeholder="Выберите услугу ..." 
                    has_custom_scroll={true} 
                    onChange={this.typeahead_service_changed} 
                    on_blur={this.typeahead_lost_focus}
                    options={this.state.services && this.state.services.toJS()}>

                    {this.state.service_tags.map( (bt,index) => 
                      <div key={index} className="catalog-page-tag catalog-page-tag-services">
                        <span onMouseDownCapture={_.bind(this.on_remove_service_tag, this, bt.get('id') )} className="catalog-page-tag-close">
                          <span className="svg-icon_close"></span>
                        </span>
                        <span className="catalog-page-tag-text">{bt.get('title')}</span>
                      </div>).toJS()}

                  </Typeahead>                
              </div>
            </div>
          </div>
        </div>        


      </div>
    );
  }
});



module.exports = CatalogSearch;
