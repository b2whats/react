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
var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');
Modal.setAppElement(appElement);



var modal_store = require('stores/modal_store.js');
//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
		modalIsOpen: modal_store.get_modal_visible()
	  }),
	modal_store /*observable store list*/);

var kDEFAULT_REGION_ID = 'sankt-peterburg';

var ModalMixin = require('../mixins/modal_mixin.js');
var ButtonGroup = require('components/forms_element/button_group.jsx');
var Register = require('./register.jsx');


var Header = React.createClass({
  mixins: [PureRenderMixin,RafBatchStateUpdateMixin,ModalMixin],


  render () {

	return (
	  <div className="hfm-wrapper main-header header entire-width">

		<RegionSelector />

		<div className="top-navbar">
		  <Link
			className="h_link"
			href={route_names.kROUTE_CATALOG}
			params={ {
			  region_id: kDEFAULT_REGION_ID,
			  type: '_',
			  brands: '_',
			  services: '_'} }>Каталог компаний</Link>

		  <Link className="no-href">|</Link>

		  <Link className="ap-link" onClick={this.openModal('register')}>Регистрация</Link>

		  <Link className="ap-link" onClick={this.openModal('signin')}>Вход</Link>

		  <Modal
			  isOpen={!!this.state.modalIsOpen.get('signin')}
			  onRequestClose={this.handleModalCloseRequest}
		  >
			<div className='sign-in autoparts'>
			  <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
			  <h2>Вход</h2>
			  <label className='new_context'>
				E-mail
				<input type='text' name='email'/>
			  </label>
			  <label className='new_context'>
					Пароль
				<input type='password' name='password'/>
				  <a className='fs12 f-r bbd m4-0'>Забыли пароль?</a>
			  </label>
			  <button className='m15-0' name='signin'>Войти</button>
				<hr className='hr100'/>
				<div className='h14'></div>
				<p className='fc-g fs13'> Или войдите через вашу социальную сеть:</p>
				<p>
				  <i className="icon-facebook-rect fs24 fc-g"></i>
				  <i className="icon-vkontakte-rect fs24 fc-g"></i>
				</p>
			</div>
		  </Modal>
          <Modal
              isOpen={!!this.state.modalIsOpen.get('register')}
              onRequestClose={this.handleModalCloseRequest}
          >
            <Register />
          </Modal>
		</div>
	  </div>
	);
  }
});

module.exports = Header;
