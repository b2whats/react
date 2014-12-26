
'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js');
var event_names = require('shared_constants/event_names.js');

var bin_actions_ = [
  ['default_page_size_chaged', event_names.kON_DEFAULT_PAGE_SIZE_CHANGED]
]


var kACTION_FUNCTION_NAME_IDX = 0;
var kACTION_EVENT_NAME_IDX = 1;


module.exports =  _.reduce(bin_actions_, function(memo, action_name_evt) {

  memo[ action_name_evt[kACTION_FUNCTION_NAME_IDX] ] = function() {
    var args = [].slice.call(arguments);
    args.splice(0,0, action_name_evt[kACTION_EVENT_NAME_IDX]);
    main_dispatcher.fire.apply(main_dispatcher, args);
  };
  
  return memo;
}, {});
