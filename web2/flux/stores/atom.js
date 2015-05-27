'use strict';
//main_store
var immutable = require('immutable');

var _ = require('underscore');
var cursor = require('immutable/contrib/cursor');
var atom_ = immutable.Map(window.__atom__ || {});


var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();
//var shared_constants = require('shared_constants');
var event_names = require('shared_constants/event_names.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');


var atom_store = merge(Emitter.prototype, {
  get state() {
    return atom_;
  },
  get_in: function (name) {
    if (_.isArray(name)) {
      return atom_.getIn(name);
    } else {
      return atom_.getIn([name]);
    }

  },
  get_cursor: function(name, callback) {
    var update_fn = function(new_atom) {
      //atom_ = atom_.merge(new_atom);
      atom_ = new_atom;
      window.__atom__ = atom_;

      //atom_store.fire(event_names.kON_CHANGE);
      //// console.log(atom_.toString().indexOf('Seq')); //так тестить что нигде случайно незамапил на динамическую последовательность
      if(callback) { //механизм для оповещения основного курсора если был изменен подкурсор
        console.error('ваще не думаю что это надо');
        callback(cursor.from(atom_, name, update_fn));
      }
    };
    return cursor.from(atom_, name, update_fn);
  },
  $assert_info: main_dispatcher.get_assert_info()
});

module.exports = atom_store;
