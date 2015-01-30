'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');


var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');
var immutable = require('immutable');


var state_ =  init_state(_.last(__filename.split('/')), {
    company_information: {}
});

var cncl_ = [
    main_dispatcher
        .on(event_names.kACCOUNT_COMPANY_INFO_LOADED, info => {
            state_.company_information_cursor
                .update(() => immutable.fromJS(info[0]));
            account_page_store.fire(event_names.kON_CHANGE);
        }, 100000),
    main_dispatcher
        .on(event_names.kON_FORM_UPDATE, (name, value)  => {
            state_.company_information_cursor
                .update(m => m.set(name,value));
            account_page_store.fire(event_names.kON_CHANGE);
        },100000),
];



var account_page_store = merge(Emitter.prototype, {
    get_company_information () {
        return state_.company_information;
    },
    dispose () {
        console.log('dispose');
        if(cncl_) {
            _.each(cncl_, cncl => cncl());
        }
        cncl_ = null;
    },
    $assert_info: main_dispatcher.get_assert_info()
});


module.exports = account_page_store;