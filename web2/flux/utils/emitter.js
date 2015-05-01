'use strict';

var _ = require('underscore');
var shared_constants = require('shared_constants');
var event_names = require('shared_constants/event_names.js');

function emitter() {
}

function error(description) {
  console.error(description);
  console.trace();
  throw new Error(description);
}

emitter.prototype.fire = function() { //сразу диспатчим
  if(!this.listeners_){
    return;
  }

  var args = [].slice.call(arguments);
  var evt_name = args.shift();
  if(evt_name in this.listeners_) {        
    var listeners_sorted = _.sortBy(this.listeners_[evt_name], function(listener_obj){return listener_obj.priority;});
    _.each(listeners_sorted, function(listener_obj) {
      listener_obj.listener.apply(null, args);
    });
  }
};        

emitter.prototype.destroy = function() {
  if(this.listeners_) {
    delete this.listeners_;
  }
};


emitter.prototype.on = function(evt_name, listener, priority) {
  if(evt_name===undefined || evt_name===null) {
    console.error('event name undefined');
    console.trace();
    throw new Error('event name undefined');
  }

  if(priority===undefined && evt_name!==event_names.kON_CHANGE) {
    console.error('YOU MUST DEFINE PRIORITY FOR EVENT ', evt_name);
  }

  if(!this.listeners_){
    this.listeners_ = {};
    this.dispatcher_id_ = 0;
  }
  
  this.listeners_[evt_name] = this.listeners_[evt_name] || {};
  priority = priority || shared_constants.kDEFAULT_STORE_PRIORITY;
  this.listeners_[evt_name]['d_' + this.dispatcher_id_] = {priority:priority, listener:listener};

  var cancellation_id = this.dispatcher_id_;
  
  ++this.dispatcher_id_;
  var self = this;
  return function() {
    if(cancellation_id!==-1) {
      delete self.listeners_[evt_name]['d_' + cancellation_id];
      cancellation_id=-1;
    } else {
      throw new Error('event already cancelled');
    }      
  };
};

emitter.prototype.assert_wait_for = function(event_name) {
  
  if(!this.$assert_info){
    error('current module does not support assert_info');
  }

  var current_defs = _.filter(this.$assert_info, function(info) {
    return info.evt_name === event_name;
  });
  
  if(current_defs.length===0) {
    error('current module does not subscribed on event '+event_name);
  }

  if(current_defs.length>1) {
    error('current module has more than one subscriber on event ' + event_name);
  }

  var current_info = current_defs[0];

  var args = [].slice.call(arguments, 1);

  _.each(args, function(store, store_index) {
    var assert_info = store.$assert_info;
    if(!assert_info){
      error('argument ' + (1+store_index) + ' does not support assert_info');
    }

    var filtered_assert_info = _.filter(assert_info, function(info){return info.evt_name === event_name;});

    if(filtered_assert_info.length===0) {
      error('argument ' + (1+store_index) + ' does not subscribed on event');
    }

    
    if(_.some(filtered_assert_info, function(info){ return info.priority>=current_info.priority; })) {
      error('argument ' + (1+store_index) + ' priority is lower than my');
    }
    


  });


};


module.exports = emitter;
