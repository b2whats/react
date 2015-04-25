'use strict';
var modal_actions = require('actions/modal_actions.js');

var ModalMixin = {
    openModal: function(id) {
        return () => modal_actions.open_modal(id);
    },
    closeModal: function() {
        modal_actions.close_modal();
    },
    handleModalCloseRequest: function() {
        modal_actions.close_modal();
    }
};

module.exports = ModalMixin;