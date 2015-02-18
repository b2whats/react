'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = require('immutable');
var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
Modal.setAppElement(appElement);

var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var modal_store = require('stores/modal_store.js');
var ModalMixin = require('../mixins/modal_mixin.js');

var EditableForms = require('components/editable_forms/editable_forms.jsx');
var editable_forms_actions = require('actions/editable_forms_actions.js');
var editable_forms_store = require('stores/editable_forms_store.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
		return ({ //state update lambda
			modalIsOpen         : modal_store.get_modal_visible(),
			formsIsEdit         : editable_forms_store.get_forms_editable(),
			company_information : account_page_store.get_company_information(),
			company_filials     : account_page_store.get_company_filials(),
			current_filial      : account_page_store.get_current_filial(),
		})
	},
	modal_store, editable_forms_store, account_page_store/*observable store list*/);

var Snackbar = require('components/snackbar/snackbar.jsx');
var route_actions = require('actions/route_actions.js');


var AccountInfo = React.createClass({
	mixins : [
		PureRenderMixin,
		RafBatchStateUpdateMixin,
		ModalMixin
	],

	startEdit         : function (id) {
		return () => editable_forms_actions.start_edit(id);
	},
	endEdit           : function () {
		editable_forms_actions.end_edit();
		account_page_actions.update_company_information(this.state.company_information.toJS());
	},
	toggleEdit        : function (id) {
		return () => (!this.state.formsIsEdit.get(id)) ?
			editable_forms_actions.start_edit(id) :
			editable_forms_actions.end_edit();
	},
	updateFormElement : function (name) {
		return (value) => account_page_actions.update_form(name, value);
	},
	extOpenModal(id_modal, id_element) {
		return () => {
			account_page_actions.change_current_filial(id_element);
			this.openModal(id_modal)();
		}
	},

	deleteFilial : function (id_filial) {

		return () => {
			account_page_actions.delete_filial(id_filial);
		}
	},
	btnChange    : function (name) {
		this.refs.snack.show();
	},
	render() {
		return (
			<div className='entire-width'>
        dasdasdasd
			</div>
		);
	}
});

module.exports = AccountInfo;
