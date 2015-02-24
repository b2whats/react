'use strict';


var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var route_names = require('shared_constants/route_names.js');
/* jshint ignore:start */
var Link = require('components/link.jsx');
var RegionSelector = require('./region_selector.jsx');
/* jshint ignore:end */
var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');
Modal.setAppElement(appElement);

var kDEFAULT_REGION_ID = 'sankt-peterburg';

var ModalMixin = require('../mixins/modal_mixin.js');
var ButtonGroup = require('components/forms_element/button_group.jsx');
var Register = require('./register.jsx');
var SignIn = require('./signin.jsx');
var form_actions = require('actions/form_actions.js');
var auth_store = require('stores/auth_store.js');
var region_store = require('stores/region_store.js');
var route_actions = require('actions/route_actions.js');
var modal_store = require('stores/modal_store.js');
var auth_actions = require('actions/auth_actions.js');



var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
		modalIsOpen : modal_store.get_modal_visible(),
		is_auth      : auth_store.is_auth(),
    email : auth_store.get_email(),
	}),
	modal_store, auth_store /*observable store list*/);
var Header = React.createClass({
	mixins       : [
		PureRenderMixin,
		RafBatchStateUpdateMixin,
		ModalMixin
	],
	extOpenModal : function (id_modal) {
		return () => {
			form_actions.reset_form_validate();
			this.openModal(id_modal)();
		}
	},
  logOut() {
    //console.log('control - logout');
    auth_actions.log_out();
    route_actions.goto_link_w_params('/:region_id',
      {region_id: region_store.get_region_current()}
    );
  },

	render() {
		return (
			<div className="hfm-wrapper main-header header entire-width">

				<RegionSelector />

				<div className="top-navbar">
					<Link
						className="h_link"
						href={route_names.kROUTE_CATALOG}
						params={ {
							region_id : kDEFAULT_REGION_ID,
							type      : '_',
							brands    : '_',
							services  : '_'
						} }>Каталог компаний</Link>

					<Link className="no-href">|</Link>
					{(!this.state.is_auth) ?
						<span>
							<Link className="ap-link" onClick={this.extOpenModal('register')}>Регистрация</Link>
							<Link className = "ap-link" onClick={this.extOpenModal('signin')}>Вход</Link>
						</span>
						:
						<Link className = "ap-link" onClick={this.logOut}>{this.state.email}</Link>
						}


			<SignIn />
      <Modal
          isOpen={!!this.state.modalIsOpen.get('register')}
          onRequestClose={this.handleModalCloseRequest}>
        <Register />
      </Modal>
		</div>
	  </div>
	);
  }
});

module.exports = Header;
