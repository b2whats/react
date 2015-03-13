'use strict';

var React = require('react/addons');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var ModalMixin = require('../mixins/modal_mixin.js');

var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');
Modal.setAppElement(appElement);

var auth_store = require('stores/auth_store.js');
var auth_actions = require('actions/auth_actions.js');

var modal_store = require('stores/modal_store.js');
var route_actions = require('actions/route_actions.js');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({
      auth_field_validation : auth_store.get_auth_field_validation(),
      is_auth               : auth_store.is_auth(),
      path                  : auth_store.get_path(),
      modalIsOpen           : modal_store.get_modal_visible()
    })
  },
  auth_store, modal_store);

var cx = React.addons.classSet;

var SignIn = React.createClass({
  mixins : [
    ModalMixin,
    RafBatchStateUpdateMixin
  ],

  authSubmit : function (e) {
    e.preventDefault();
    auth_actions.submit_form({
      email    : this.refs.email.getDOMNode().value,
      password : this.refs.password.getDOMNode().value
    });
  },

  componentWillUpdate : function (nextProps, nextState) {
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

  render() {
    return (
      <Modal
        isOpen={!!this.state.modalIsOpen.get('signin')}
        onRequestClose={this.handleModalCloseRequest}>

        <form onSumbit={this.authSubmit} className='sign-in autoparts'>
          <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
          <h2>Вход</h2>
          <label className='new_context'>
            <span className='d-b m5-0 fs14'>E-mail</span>

            <input
              ref='email'
              type='text'
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
              className={cx({
                'bs-error' : !!this.state.auth_field_validation.has('password'),
                'w100pr'   : true
              })}/>
            <a className='fs12 f-R bbd m5-0'>Забыли пароль?</a>
          </label>
          <button className='m15-0' onClick={this.authSubmit}>Войти</button>
          <hr className='hr100'/>
          <div className='h14'></div>
          <p className='fc-g fs13'> Или войдите через вашу социальную сеть:</p>
          <p>
            <i className="icon-facebook-rect fs24 fc-g"></i>
            <i className="icon-vkontakte-rect fs24 fc-g"></i>
          </p>
        </form>
      </Modal>
    );
  }
});

module.exports = SignIn;
