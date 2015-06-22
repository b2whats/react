'use strict';

var React = require('react/addons');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var ModalMixin = require('../mixins/modal_mixin.js');

var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');

var auth_store = require('stores/auth_store.js');
var auth_actions = require('actions/auth_actions.js');

var modal_store = require('stores/ModalStore.js');
var route_actions = require('actions/route_actions.js');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({
      auth_field_validation: auth_store.get_auth_field_validation(),
      is_auth: auth_store.is_auth(),
      path: auth_store.get_path(),
      modalIsOpen: modal_store.getModalIsOpen()
    })
  },
  auth_store, modal_store);

var cx = require('classnames');

var SignIn = React.createClass({
  mixins: [
    ModalMixin,
    RafBatchStateUpdateMixin
  ],
  getInitialState() {
    return ({
      forgotError: null
    });
  },
  authSubmit: function (e) {
    auth_actions.submit_form({
      email: this.refs.email.getDOMNode().value,
      password: this.refs.password.getDOMNode().value
    });
  },

  componentWillUpdate: function (nextProps, nextState) {
    if (nextState.is_auth && !this.state.is_auth) {

      //прошла авторизация отправляем туда куда шел
      if (nextState.path) {
        route_actions.goto_link(nextState.path);
        auth_actions.save_path(null); //больше не нужен
      }
      else {
        this.closeModal(); //авторизация прошла закрыть окно
      }
    }
  },
  extOpenModal(id_modal) {
    return () => {
      this.openModal(id_modal)();
    }
  },
  forgotPassword() {
    const mail = React.findDOMNode(this.refs.forgotEmail).value;
    auth_actions.forgotPassword(mail);
    this.setState({forgotError: 'Проверьте вашу почту'});
  },
  render() {
    return (
      <Modal
        isOpen={!!this.state.modalIsOpen.get('signin')}
        onRequestClose={this.handleModalCloseRequest}>

        <form onSubmit={this.authSubmit} className='sign-in autoparts' target="auth_frame">
          <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
          <h2>Вход</h2>
          <label className='new_context'>
            <span className='d-b m5-0 fs14'>E-mail</span>

            <input
              ref='email'
              type='text'
              name='email'
              className={cx({
                'bs-error' : !!this.state.auth_field_validation.has('email'),
                'w100pr'   : true
              })}/>
          </label>
          <label className='new_context'>
            <span className='d-b m5-0 fs14'>Пароль</span>
            <input
              ref='password'
              type='password'
              name='password'
              className={cx({
                'bs-error' : !!this.state.auth_field_validation.has('password'),
                'w100pr'   : true
              })}/>
            <a className='fs12 f-R bbd m5-0 cur-p' onClick={this.extOpenModal('forgotPassword')}>Забыли пароль?</a>
          </label>
          <button className='m20-0' type='submit'>Войти</button>
          <hr className='hr100'/>
          <div className='h14'></div>
          <p className='fc-g fs13'> Или войдите через вашу социальную сеть:</p>

          <p>
            <i className="icon-facebook-rect fs24 fc-g"></i>
            <i className="icon-vkontakte-rect fs24 fc-g"></i>
          </p>
        </form>
        <iframe name="auth_frame" className='d-N'></iframe>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('forgotPassword')}
          onRequestClose={this.handleModalCloseRequest}
          >
          <div className="w400px">
            <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
            <h2>Восстановление пароля</h2>
            <label className='new_context'>
              <span className='d-b m5-0 fs14'>E-mail</span>

              <input
                ref='forgotEmail'
                type='text'
                name='email'
                className={cx({
                  'w100pr'   : true
                })}/>
            </label>
            <div className="ta-R fs12 c-green-500">{this.state.forgotError}</div>
            <button onClick={this.forgotPassword} className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' type='submit'>Выслать пароль</button>
          </div>
        </Modal>
      </Modal>
    );
  }
});

module.exports = SignIn;
