'use strict';
//основной диспатчер - броадкастит все сообщения всем подписчикам
//отличия от flux явное указание приоритета store
//для серверного рендеринга буду явно гнать событие serialize deserialize на котором будет сидеть сериалайзер-десериалазер
var _ = require('underscore'); // манипуляции над коллекциями. http://underscorejs.org/

var emitter = require('utils/emitter.js'); //эмитит эвенты https://github.com/component/emitter
var merge = require('utils/merge.js'); //объединяет и клонирует объекты

// Диспетчер - это такой эмиттер эвентов 
module.exports = merge(emitter.prototype, {

  create_proxy: function() {
    var self = this;
    var subscribers = [];
    return {
      on: function(evt_name, callback, priority) {
        subscribers.push({evt_name:evt_name, priority:priority});
        var args = [].slice.call(arguments);
        return self.on.apply(self, args);
      },
      fire: function() {
        var args = [].slice.call(arguments);
        return self.fire.apply(self, args);
      },
      get_assert_info: function() {
        return subscribers;
      }
    };
  }
});
