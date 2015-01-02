'use strict';
/**
* Тайпахед заточенный под поиск автозапастей
*/

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var search_actions = require('actions/auto_part_search_actions.js');

var suggestion_store = require('stores/auto_part_suggestion_store.js');

//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  suggestion_list: suggestion_store.get_suggestion_list (),
  suggestion_list_state: suggestion_store.get_suggestion_list_state(),
  suggestion_value: suggestion_store.get_suggestion_value(),
  suggestion_search_term: suggestion_store.get_suggestion_search_term(),
  suggestion_show_value: suggestion_store.get_suggestion_show_value()
}),
suggestion_store /*observable store list*/);

var kLINE_ID = 0;
var kLINE_ARTICUL = 1;
var kLINE_PRODUCER = 2;
var kLINE_SENTENCE_INDEX = 3;  

var kHEADERS=['Артикул', 'Производитель', 'Наименование'];

var kCOLUMNS = 3;
var kCOLUMN_TITLE_IDX = 2;

var AutoPartsSearchWrapper = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  propTypes: {
    list_width: PropTypes.number,
    placeholder: PropTypes.string,
    on_value_changed: PropTypes.func
  },

  componentWillMount() {
    this.last_st = '';
  },


  typeahead_search (options, search_term, cb) { //вариант без      
    search_actions.suggest(search_term, {cb: cb, search_term: search_term});
    search_actions.search_term_changed(search_term);
    this.last_st = search_term;
  },

  typeahead_changed (value) {
    this.last_st = null; //нет смысла обновлять и показывать список
    console.log('auto_part value_changed', value);
    search_actions.value_changed(value);
    search_actions.search_term_changed(value.title[kCOLUMN_TITLE_IDX]);
    if(this.props.on_value_changed !== undefined) {
      this.props.on_value_changed.apply(null, [value.id].concat(value.title));
    }
  },
  
  typeahead_lost_focus () {    
    console.log('auto_part_lost_focus'); //закончили редактирование тайпахеда
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

    //console.log(this.state.suggestion_show_value.toJS(), this.state.suggestion_value.toJS(), this.state.suggestion_search_term);

    return (      
      <Typeahead
        show_value={this.state.suggestion_show_value.toJS()}         
        columns={kCOLUMNS}
        column_title_idx={kCOLUMN_TITLE_IDX}
        column_headers={kHEADERS} 
        list_width={this.props.list_width} 
        placeholder={this.props.placeholder} 
        has_custom_scroll={true} 
        onChange={this.typeahead_changed}
        on_blur={this.typeahead_lost_focus} 
        search={this.typeahead_search} />
    )
  }
});

module.exports = AutoPartsSearchWrapper;
