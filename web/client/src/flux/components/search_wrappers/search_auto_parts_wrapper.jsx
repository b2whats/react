'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var typeahead_actions = require('actions/typeahead_actions.js');

var suggestion_store = require('stores/suggestion_store.js');

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

var kHEADERS=['Артикул', 'Производитель', 'Наименование'];

var SearchAutoPartsWrapper = React.createClass({
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
          this.state.suggestion_list.map( line => ({
            id: line.get(kLINE_ID), 
            title: [line.get(kLINE_ARTICUL), line.get(kLINE_PRODUCER),line.get(kLINE_SENTENCE_INDEX)]}) ).toJS() || [];

        this.state.suggestion_list_state.get('cb')(null, options);
        this.last_st = null; //больше не надо вызывать
      }
    }

    return (      
      <Typeahead 
        columns={3} 
        column_title_idx={2}
        column_headers={kHEADERS} 
        list_width={this.props.list_width} 
        placeholder={this.props.placeholder} 
        has_custom_scroll={true} 
        onChange={this.typeahead_changed} 
        search={this.typeahead_search} />
    )
  }
});

module.exports = SearchAutoPartsWrapper;
