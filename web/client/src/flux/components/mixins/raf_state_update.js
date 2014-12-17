'use strict';
/**
Повеситься на обработку store kON_CHANGE событий и делать апдейт своего состояния в requestAnimationFrame
*/

var _ = require('underscore');
var raf = require('utils/raf.js');
var event_names = require('shared_constants/event_names.js');


var rafBatchStateUpdateMixinCreate = function(get_state) {
  var stores = [].slice.call(arguments).slice(1);

  return {
    event_disablers:[],
  
    getInitialState () {
      return get_state();
    },  

    on_change_handler () {
      var state = get_state();
      raf(() => {
        this.replaceState(state)
      }, null, this.constructor.displayName);
    },
    
    componentWillMount () {
      this.event_disablers = _.map(stores, function(store) {
        return store.on(event_names.kON_CHANGE, this.on_change_handler);
      }, this);
    },

    componentWillUnmount() {
      _.each(this.event_disablers, function(disabler) {
        disabler();
      }, this);
      this.event_disablers = [];
    }
    
  };
};

module.exports = rafBatchStateUpdateMixinCreate;
