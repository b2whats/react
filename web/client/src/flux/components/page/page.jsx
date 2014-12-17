'use strict';

var React = require('react/addons');

var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');
var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Button = require('react-bootstrap/Button');//можно так require('react-bootstrap').Button
/* jshint ignore:end */

var page_store = require('stores/page_store.js');

//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //лямбда для update this.state
  page_state: page_store.get_state_ro()
}),
page_store /*если компоненте надо несколько store то перечисляем их тут через запятую*/);

var Page = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  render () {
    var page_data = this.state.page_state;
    
    /* jshint ignore:start */
    return (
      <div>
        <h3>Page id = {page_data.get('id')}</h3>
        <div>page = {page_data.get('page')}</div>
        <br/>
        <Button>React Bootstrap кнопка</Button>
        <br/><br/>
        <a href={`/page/${1*page_data.get('id') - 1}`}>go to prev</a> &nbsp; <a href={`/page/${1*page_data.get('id') + 1}`}>go to next</a>
        <br/><br/>
        <a href="/">go to main</a>

      </div>
    )
    /* jshint ignore:end */
  }
});

module.exports = Page;
