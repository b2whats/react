'use strict';

//var _ = require('underscore');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

/* jshint ignore:start */
var Typeahead = require('./typeahead.jsx');
/* jshint ignore:end */

var typeahead_actions = require('actions/typeahead_actions.js');

var suggestion_store = require('stores/suggestion_store.js');

//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
  suggestion_list: suggestion_store.get_suggestion_list ()
}),
suggestion_store /*observable store list*/);


var TypeaheadPage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  last_cb: null,

  typeahead_search (options, search_term, cb) { //вариант без    
    
    if((''+ (search_term || '')).trim().length < 1) {
      
      cb(null,[]);
      this.last_cb = null;
    } else {
      typeahead_actions.suggest(search_term);
      this.last_cb = cb;
      this.last_st = search_term;
    }
  },

  typeahead_changed (value) {

    this.last_cb = null;
    console.log('value_changed', value);
    //сохранить в состоянии
  },

  typeahead_tmp (options, search_term, cb) { //вариант с колбеком
    typeahead_actions.suggest(search_term);
    cb(null, [{id:'1', title: 'fddfdfddsfds s ff'}, {id:'2', title: 'dddddd   '}]);
  },

  render () {

    var kLINE_ID = 0;
    var kLINE_ARTICUL = 1;
    var kLINE_PRODUCER = 2;
    var kLINE_SENTENCE_INDEX = 3;

    

    var options = this.state.suggestion_list && 
      this.state.suggestion_list.map( line => ({id: line.get(kLINE_ID), title: line.get(kLINE_SENTENCE_INDEX)}) ).toJS() || [];

    if(this.last_cb) {
      this.last_cb(null, options, this.last_st);
      this.last_cb = null;
    }

    return (      
      <div className="tp-full-height-emul tp-hidden-overflow tp-relative">{/*сэмулирую body height:100% и overflow:hidden*/}
        <div className="tp-finders">
          <div className="tp-search">
            <div className="tp-search-panel">
              <h5 className="tp-search-header">ПОИСК АВТОЗАПЧАСТЕЙ</h5>
              <div className="tp-search-content">
                <Typeahead search={this.typeahead_tmp}/>
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
                <Typeahead onChange={this.typeahead_changed} search={this.typeahead_search} />
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
