'use strict';


var React = require('react/addons');
var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');




var ModalMixin = require('../mixins/modal_mixin.js');

var auth_store = require('stores/auth_store.js');
var auth_actions = require('actions/auth_actions.js');
var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
        return ({
            auth_field_validation: auth_store.get_auth_field_validation(),
        })},
    auth_store);

var cx = React.addons.classSet;

var SignIn = React.createClass({
    mixins: [ModalMixin,RafBatchStateUpdateMixin],

    authSubmit: function()  {
        auth_actions.submit_form({
            email: this.refs.email.getDOMNode().value ,
            password: this.refs.password.getDOMNode().value
        });
    },
    render () {
        return (
            <div className='sign-in autoparts'>
                <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                <h2>Вход</h2>
                <label className='new_context'>
                    E-mail
                    <input
                        ref='email'
                        type='text'
                        className={cx({'bs-error': !!this.state.auth_field_validation.has('email')})}/>
                </label>
                <label className='new_context'>
                    Пароль
                    <input
                        ref='password'
                        type='password'
                        className={cx({'bs-error': !!this.state.auth_field_validation.has('password')})}/>
                    <a className='fs12 f-r bbd m4-0'>Забыли пароль?</a>
                </label>
                <button className='m15-0' onClick={this.authSubmit}>Войти</button>
                <hr className='hr100'/>
                <div className='h14'></div>
                <p className='fc-g fs13'> Или войдите через вашу социальную сеть:</p>
                <p>
                    <i className="icon-facebook-rect fs24 fc-g"></i>
                    <i className="icon-vkontakte-rect fs24 fc-g"></i>
                </p>
            </div>
        );
    }
});

module.exports = SignIn;
