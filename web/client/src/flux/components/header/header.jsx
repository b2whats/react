'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var RegionSelector = require('./region_selector.jsx');
/* jshint ignore:end */
var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');
var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');
Modal.setAppElement(appElement);

var modal_actions = require('actions/modal_actions.js');

var modal_store = require('stores/modal_store.js');
//State update and stores for which we need intercept kON_CHANGE events
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
      modalIsOpen: modal_store.get_modal_visible()
    }),
    modal_store /*observable store list*/);
var Header = React.createClass({
  mixins: [PureRenderMixin,RafBatchStateUpdateMixin],

  openModal: function() {
    console.log('hendler');
    modal_actions.open_modal();
  },

  closeModal: function() {
    modal_actions.close_modal();
  },
  handleModalCloseRequest: function() {
    modal_actions.close_modal();
  },
  render () {
    console.log('render_header');

    return (
      <div className="hfm-wrapper main-header header entire-width">

        <RegionSelector />

        <div className="top-navbar">
          <Link className="h_link" href="/">Каталог компаний</Link>
          <Link className="no-href">|</Link>
          <Link className="ap-link" href="/">Регистрация</Link>
          <Link className="ap-link" onClick={this.openModal}>Вход</Link>
          <Modal
              isOpen={this.state.modalIsOpen}
              onRequestClose={this.handleModalCloseRequest}
          >
            <div className='sign-in autoparts'>
              <div className='ReactModal__Content-close' onClick={this.closeModal}></div>
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
                <hr/>
                <div className='h14'></div>
                <p className='fc-g fs13'> Или войдите через вашу социальную сеть:</p>
                <p>
                  <i className="icon-facebook-rect fs24 fc-g"></i>
                  <i className="icon-vkontakte-rect fs24 fc-g"></i>
                </p>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
});

module.exports = Header;
