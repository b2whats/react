'use strict';
var _ = require('underscore');

var raf = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(cb) { return window.setTimeout(cb, 1000 / 60); };

var anim_frame_already_requested_ = false;
var anim_frame_resolves_list_ = [];

var anim_frame_resolves_dict_ = {};

var requester_call_ = function() {
  anim_frame_already_requested_ = false;
  var call_apply = false;

  var anim_frame_resolves_list = anim_frame_resolves_list_.splice(0, anim_frame_resolves_list_.length);
  
  if(_.keys(anim_frame_resolves_dict_).length>0) {
    var anim_frame_resolves_dict_list = _.map(anim_frame_resolves_dict_, function(v){return v;});
    anim_frame_resolves_list = anim_frame_resolves_list.concat(anim_frame_resolves_dict_list);
    anim_frame_resolves_dict_ = {};
  }

  while(anim_frame_resolves_list.length>0) {

    var call_param = anim_frame_resolves_list.shift();
    var params = call_param.params;
    call_apply = call_apply || call_param.call_apply;
    if(call_param.count) {
      //console.log(call_param.count);
    }

    if(_.isFunction(params)){
      
      params = params();          
      
    }
  }

  if(call_apply) {
    if(_.isFunction(call_apply)) {
      call_apply();
    } 
  }
};

module.exports = function(params, call_apply, call_id) {
  //if(call_apply===undefined) call_apply = true;

    if(call_id) {
      //в таких событиях важно только последнее
      if(call_id in anim_frame_resolves_dict_) {
        _.extend(anim_frame_resolves_dict_[call_id], {params:params, call_apply:call_apply, count:anim_frame_resolves_dict_[call_id].count+1});
      } else {
        anim_frame_resolves_dict_[call_id] = {params:params, call_apply:call_apply, count:0};
      }

    } else {
      anim_frame_resolves_list_.push({params:params, call_apply:call_apply});
    }

    if(!anim_frame_already_requested_){
      anim_frame_already_requested_ = true;
      raf(requester_call_);
    }
    

};
