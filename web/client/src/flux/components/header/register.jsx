'use strict';


var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var ModalMixin = require('../mixins/modal_mixin.js');
var ButtonGroup = require('components/forms_element/button_group.jsx');

var Register = React.createClass({
    mixins: [ModalMixin,React.addons.LinkedStateMixin],
    getInitialState: () => ({
        type: 2,
        email: '',
        password: '',
        login: '',
        company_name: '',
        phone: ''
    }),

    registerSubmit: function()  {

    },
    groupButton: function(value) {
        var self = this;
        return function() {
            self.setState({
                type: value
            });
        }
    },
    render () {

        return (
            <div className='ta-c'>
                <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                <h2 className='m15-0 mb50'>Регистрация</h2>
                <span className='mr10 fs16'>Я</span>
                    <ButtonGroup select_element_value={this.state.type} onChange={this.groupButton}>
                        <button name='type' className='btn-bg-group w130px' value='1'>Покупатель</button>
                        <button name='type' className='btn-bg-group w130px' value='2'>Поставщик</button>
                    </ButtonGroup>
                {(this.state.type == 2) &&
                    <div>
                        <label>
                            Название компании
                            <input ref='company_name' type='text' name='company_name' valueLink={this.linkState('company_name')}/>
                        </label>
                        <label>
                            Телефон
                            <input ref='phone' type='text' name='phone' valueLink={this.linkState('phone')}/>
                        </label>
                    </div>
                }

                <label>
                    E-mail
                    <input ref='email' type='text' name='email' valueLink={this.linkState('email')}/>
                </label>
                <label>
                    Логин
                    <input ref='login' type='text' name='login' valueLink={this.linkState('login')}/>
                </label>
                <label>
                    Пароль
                    <input ref='password' type='password' name='password' valueLink={this.linkState('password')}/>
                </label>
                <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' name='register' onClick={this.registerSubmit}>Зарегистрироваться</button>
            </div>
        );
    }
});

module.exports = Register;
