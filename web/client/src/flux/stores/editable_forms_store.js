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
    formsIsEdit: {},
    company_information: immutable.fromJS({
        name: 'Название',
        site: 'www.site.com',
        description: 'Наша компания занимается, наша компания занимается продажей запчастей'
    }),
});

var cncl_ = [
    main_dispatcher
        .on(event_names.kON_FORM_START_EDIT, (id)  => {
            console.log('forms disp');
            state_.formsIsEdit_cursor
                .update(m => m.set(id,true));
            editable_forms_store.fire(event_names.kON_CHANGE);
        },100000),
    main_dispatcher
        .on(event_names.kON_FORM_END_EDIT, ()  => {
            state_.formsIsEdit_cursor
                .clear();
            editable_forms_store.fire(event_names.kON_CHANGE);
        },100000),
];



var editable_forms_store = merge(Emitter.prototype, {
    get_forms_editable () {
        return state_.formsIsEdit;
    },
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


module.exports = editable_forms_store;