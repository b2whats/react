'use strict';


var React = require('react/addons');
var _ = require('underscore');

var PureRenderMixin = React.addons.PureRenderMixin;
var ModalMixin = require('../mixins/modal_mixin.js');
var ButtonGroup = require('components/forms_element/button_group.jsx');


var register_store = require('stores/register_store.js');
var auth_store = require('stores/auth_store.js');
var register_actions = require('actions/register_actions.js');

var CTG = React.addons.CSSTransitionGroup;

var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
        return ({
            register_field: register_store.get_register_field(),
            register_field_validation: register_store.get_register_field_validation(),
        })},
    register_store,auth_store);
var cx = React.addons.classSet;
var Register = React.createClass({
    mixins: [ModalMixin,RafBatchStateUpdateMixin],

    registerSubmit: function()  {
        register_actions.submit_form(this.state.register_field.toJS());
    },
    updateFormElement: function(name) {
        return (e) => {
            var value = (_.isObject(e)) ? e.target.value : e;
            register_actions.update_form(name, value);
        };
    },

    render () {
        return (
            <div className='ta-c'>
                <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                <h2 className='m15-0 mB50'>Регистрация</h2>
                <span className='mR10 fs16'>Я</span>
                    <ButtonGroup select_element_value={this.state.register_field.get('type')} onChange={this.updateFormElement('type')}>
                        <button disabled={true} name='type' className='btn-bg-group w130px' value='1'>Покупатель</button>
                        <button name='type' className='btn-bg-group w130px' value='2'>Поставщик</button>
                    </ButtonGroup>

                {(this.state.register_field.get('type') == 2) &&
                        <label key={1}>
                          <span className='d-b m5-0 fs14'>Название компании</span>
                            <input type='text'
                                className={cx({'bs-error': !!this.state.register_field_validation.has('company_name'), 'w100pr' : true})}
                                defaultValue={this.state.register_field.get('company_name')}
                                onChange={this.updateFormElement('company_name')}/>
                        </label>
                }

                <label  key={2}>
                    <span className='d-b m5-0 fs14'>E-mail</span>
                    <input type='text'
                        className={cx({'bs-error': !!this.state.register_field_validation.has('email'), 'w100pr' : true})}
                        defaultValue={this.state.register_field.get('email')}
                        onChange={this.updateFormElement('email')}/>
                </label>
                <label  key={3}>
                    <span className='d-b m5-0 fs14'>Пароль</span>
                    <input type='password'
                        className={cx({'bs-error': !!this.state.register_field_validation.has('password'), 'w100pr' : true})}
                        defaultValue={this.state.register_field.get('password')}
                        onChange={this.updateFormElement('password')}/>
                </label>

                <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' name='register' onClick={this.registerSubmit}>Зарегистрироваться</button>
            </div>
        );
    }
});

module.exports = Register;
