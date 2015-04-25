'use strict';
/**
* Тайпахед заточенный под поиск автосервисов
*/

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('components/mixins/raf_state_update.js');

/* jshint ignore:start */
var Typeahead = require('components/typeahead/typeahead.jsx');
/* jshint ignore:end */

var search_actions = require('actions/autoservices_search_actions.js');

var suggestion_store = require('stores/autoservices_suggestion_store.js');

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
var kLINE_NAME = 1;
var kLINE_SERVICE_NAME = 2;


var kHEADERS=['Марка авто', 'Вид сервиса'];

var kCOLUMNS = 2;
var kCOLUMN_TITLE_IDX = 1;

var AutoServiceSearchWrapper = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  propTypes: {
    list_width: PropTypes.number,
    placeholder: PropTypes.string,
    on_value_changed: PropTypes.func,
    initial_value: PropTypes.string
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
    //console.log('autoservice value_changed', value);
    search_actions.value_changed(value);
    search_actions.search_term_changed(value.title[kCOLUMN_TITLE_IDX]);
    if(this.props.on_value_changed !== undefined) {
      this.props.on_value_changed.apply(null, [value.id].concat(value.title));
    }
  },

  typeahead_lost_focus () {    
    //console.log('autoservice_lost_focus'); //закончили редактирование тайпахеда
  },

  render () {
    
    if(this.last_st!==null && this.state.suggestion_list_state) {
      var suggeset_st = this.state.suggestion_list_state.get('search_term');
      if( suggeset_st === this.last_st) { //нет смысла показывать промежуточные списки        
        var options = this.state.suggestion_list && 
          this.state.suggestion_list.map( line => ({
            id: line.get(kLINE_ID), 
            title: [line.get(kLINE_NAME), line.get(kLINE_SERVICE_NAME)]}) ).toJS() || [];        
        this.state.suggestion_list_state.get('cb')(null, options);
        this.last_st = null; //больше не надо вызывать
      }
    }

    //console.log(this.state.suggestion_show_value.toJS(), this.state.suggestion_value.toJS(), this.state.suggestion_search_term);

    return (      
      <Typeahead
        show_value={this.state.suggestion_show_value.toJS()}
        initial_value={this.props.initial_value}         
        columns={kCOLUMNS}
        column_title_idx={kCOLUMN_TITLE_IDX}
        column_headers={kHEADERS} 
        list_width={this.props.list_width} 
        placeholder={this.props.placeholder} 
        has_custom_scroll={true} 
        onChange={this.typeahead_changed}
        on_blur={this.typeahead_lost_focus} 
        search={this.typeahead_search}
        open_results={this.props.isOpen}/>
    )
  }
});

module.exports = AutoServiceSearchWrapper;
