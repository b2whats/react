'use strict';

//var _ = require('underscore');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Typeahead = require('./typeahead.jsx');
/* jshint ignore:end */

var typeahead_actions = require('actions/typeahead_actions.js');

var suggestion_store = require('stores/auto_part_suggestion_store.js');

//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  suggestion_list: suggestion_store.get_suggestion_list (),
  suggestion_list_state: suggestion_store.get_suggestion_list_state()
}),
suggestion_store /*observable store list*/);

var kLINE_ID = 0;
var kLINE_ARTICUL = 1;
var kLINE_PRODUCER = 2;
var kLINE_SENTENCE_INDEX = 3;  



var TypeaheadPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  last_st: '',

  typeahead_search (options, search_term, cb) { //вариант без      
    typeahead_actions.suggest(search_term, {cb: cb, search_term: search_term});
    this.last_st = search_term;
  },

  typeahead_changed (value) {
    this.last_st = null; //нет смысла обновлять и показывать список
    console.log('value_changed', value);
  },


  render () {

    if(this.last_st!==null && this.state.suggestion_list_state) {
      var suggeset_st = this.state.suggestion_list_state.get('search_term');
      if( suggeset_st === this.last_st) { //нет смысла показывать промежуточные списки
        var options = this.state.suggestion_list && 
          this.state.suggestion_list.map( line => ({id: line.get(kLINE_ID), title: line.get(kLINE_SENTENCE_INDEX)}) ).toJS() || [];

        this.state.suggestion_list_state.get('cb')(null, options);
        this.last_st = null; //больше не надо вызывать
      }
    }

    return (      
      <div className="tp-full-height-emul tp-hidden-overflow tp-relative">{/*сэмулирую body height:100% и overflow:hidden*/}
        <div className="tp-finders">
          <div className="tp-search">
            <div className="tp-search-panel">
              <h5 className="tp-search-header">ПОИСК АВТОЗАПЧАСТЕЙ</h5>
              <div className="tp-search-content">
                <Typeahead />
              </div>
              <div className="tp-search-footer">
                наберите блу блу для бла бла
              </div>
            </div>
          </div>
          <div className="tp-search">
            <div className="tp-search-panel">
              <h5 className="tp-search-header">КОНСУЛЬТАЦИЯ МАСТЕРА</h5>
              <div className="tp-search-content">
                <Typeahead has_custom_scroll={true} onChange={this.typeahead_changed} search={this.typeahead_search} />
              </div>
              <div className="tp-search-footer">
                наберите бла блу от ва ку ст
              </div>
            </div>
          </div>
        </div>
        
        <div className="tp-footer-emul tp-absolute">footer emulation</div>
      </div>
    )
  }
});

module.exports = TypeaheadPage;
