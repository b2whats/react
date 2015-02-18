'use strict';
/**
Повеситься на обработку store kON_CHANGE событий и делать апдейт своего состояния в requestAnimationFrame
*/

var _ = require('underscore');
var raf = require('utils/raf.js');
var event_names = require('shared_constants/event_names.js');


var UniqueNameMixin = {    
    __internal__counter__: {value:0}, //защита от подключения одного и того же миксина в два разных реакт класса - невозможная ситуация когда я код пишу
    
    getUniqueName() {
      return this.__internal__display_name__;
    },

    componentWillMount () {      
      this.__internal__display_name__ = this.constructor.displayName + '__' + this.__internal__counter__.value++;      
    },
};

module.exports = UniqueNameMixin;
