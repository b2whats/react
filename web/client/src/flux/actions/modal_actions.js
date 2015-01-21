'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');


var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');






var actions_ = [
    ['modal_show', event_names.kON_MODAL_SHOW],
    ['modal_hide', event_names.kON_MODAL_HIDE],
];



module.exports.open_modal = function() {
    console.log('action');
    main_dispatcher.fire(event_names.kON_MODAL_SHOW);
};
module.exports.close_modal = function() {
    console.log('action');

    main_dispatcher.fire(event_names.kON_MODAL_HIDE);
};

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

