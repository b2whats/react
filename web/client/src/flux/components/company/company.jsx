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
var personal_company_page_store = require('stores/personal_company_page_store.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');
var region_store = require('stores/region_store.js');
var toggle_store = require('stores/toggle_store.js');



var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
		return ({ //state update lambda
      company_information : personal_company_page_store.get_company_information(),
      company_filials     : personal_company_page_store.get_company_filials(),
      region_current      : region_store.get_region_current(),
      toggle              : toggle_store.get_toggle()

    })
	},
	toggle_store, region_store, personal_company_page_store/*observable store list*/);

var Snackbar = require('components/snackbar/snackbar.jsx');
var route_actions = require('actions/route_actions.js');

var FilialAddressSelector = require('components/account/filial_address_selector.jsx');

var YandexMap = require('components/yandex/yandex_map.jsx');

var ymap_baloon_template =  require('components/search_page/templates/yandex_baloon_template.jsx');
var ymap_cluster_baloon_template = require('../search_page/templates/yandex_cluster_baloon_template.jsx');
var yandex_templates_events = require('components/search_page/templates/yandex_templates_events.js');
var YandexMapMarker = require('components/yandex/yandex_map_marker.jsx');

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
      if (id_element !== 'new') {
        account_page_actions.change_current_filial(id_element);
      } else {
        account_page_actions.new_filial();
      }
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
  noop() {
    console.log('noop');
  },
	render() {

    var bounds = [[59.744465,30.042834],[60.090935,30.568322]]; //определить например питером на случай если region_current не прогрузился
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }
    var YandexMarkers  = this.state.auto_part_markers &&
      this.state.auto_part_markers
        .filter( m => m.get('on_current_page') )
        .map(m =>
          <YandexMapMarker
            key={m.get('id')}
          {...m.toJS()} />)
        .toJS() || [];
    return (
			<div className='entire-width'>
				<div className='company-information w50pr '>
					<h2 className='tt-n fs26 d-ib'>{this.state.company_information.get('name')}</h2>
          <div>Описание компании</div>
					<div className='filial-company'>
						<h3 className='fs20 fw-n bc-g bb-s pb5'>Филиалы компании
							<i className='btn-question m0-10'/>
						</h3>

						<button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.extOpenModal('edit_company_filial', 'new')}>Новый филиал</button>
					</div>
				</div>
				<div className='w50pr h500px'>
          <YandexMap
            bounds={bounds}
            height={400}
            width={500}
            header_height={0}
            baloon_template={ymap_baloon_template}
            cluster_baloon_template={ymap_cluster_baloon_template}
            on_marker_click={this.noop}
            on_marker_hover={this.noop}
            on_close_ballon_click={this.noop}
            on_balloon_event={this.noop}
            on_bounds_change={this.noop}>

              {YandexMarkers}

          </YandexMap>
				</div>

			</div>
		);
	}
});

module.exports = AccountInfo;
