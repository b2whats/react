'use strict';
var modal_actions = require('actions/ModalActions.js');

var ModalMixin = {
    openModal: function(id) {
        return () => modal_actions.openModal(id);
    },
    closeModal: function() {
        modal_actions.closeModal();
    },
    handleModalCloseRequest: function() {
        modal_actions.closeModal();
    }
};

module.exports = ModalMixin;