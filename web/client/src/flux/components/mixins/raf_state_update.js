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
    __internal__counter__: {value:0}, //защита от подключения одного и того же миксина в два разных реакт класса - невозможная ситуация когда я код пишу
    /*Убрал двойную инициализацию*/
    //getInitialState () {
    //  return get_state();
    //},

    on_change_handler () {      
      var state = get_state();
      raf(() => {
        if(this.isMounted()) {
          this.replaceState(state);
        }
      }, null, this.__internal__display_name__);
    },
    
    componentWillMount () {
      console.log('Will_mount');
      this.__internal__display_name__ = this.constructor.displayName + '__' + this.__internal__counter__.value++;

      this.event_disablers = _.map(stores, function(store) {
        return store.on(event_names.kON_CHANGE, this.on_change_handler);
      }, this);


      var state = get_state();
      this.replaceState(state);
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
