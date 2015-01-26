'use strict';

var _ = require('underscore');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var catalog_actions = require('actions/catalog_actions.js');


var catalog_suggestion_store = require('stores/catalog_suggestion_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  brands: catalog_suggestion_store.get_brands(),
  brand_tags: catalog_suggestion_store.get_brand_tags(),
  services: catalog_suggestion_store.get_services(),
  show_value_hack: catalog_suggestion_store.get_show_value(),
}),
catalog_suggestion_store /*observable store list*/);


var CatalogSearch = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  componentWillMount() {
    
  },
  

  typeahead_changed (v) {    
    catalog_actions.append_brand_tag(v);
  },

  typeahead_lost_focus () { //означает что тайпахед закрылся
    console.log('typeahead lost focus');
  },

  on_remove_tag(id, e) {
    catalog_actions.remove_brand_tag(id);

    e.preventDefault();
    e.stopPropagation();
  },

  render () {
    var region_name = this.state.region_current && this.state.region_current.get('title');

    var style = {
      display: this.state.region_selection_visible ? 'block' : 'none'
    };
    
    

    return (
      

      <div className="catalog">

        <div className="catalog-page-container catalog-page-container-side-margin">
            <div className="catalog-page-info-header catalog-page-brand">
              
                <Typeahead
                  //show_value={this.state.show_value_hack.toJS()}
                  show_value={this.state.show_value_hack.toJS()}
                  placeholder="Выберите марку ..." 
                  has_custom_scroll={true} 
                  onChange={this.typeahead_changed} 
                  on_blur={this.typeahead_lost_focus}
                  options={this.state.brands && this.state.brands.toJS()}>

                  {this.state.brand_tags.map( (bt,index) => 
                    <div key={index} className="catalog-page-tag">
                      <span onMouseDownCapture={_.bind(this.on_remove_tag, this, bt.get('id') )} className="catalog-page-tag-close">
                        <span className="svg-icon_close"></span>
                      </span>
                      <span className="catalog-page-tag-text">{bt.get('title')}</span>
                    </div>).toJS()}

                </Typeahead>
              
            </div>
        </div>        


      </div>
    );
  }
});



module.exports = CatalogSearch;
