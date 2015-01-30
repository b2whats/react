'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = require('immutable');
var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
    Modal.setAppElement(appElement);

var rafBatchStateUpdateMixinCreate =require('../mixins/raf_state_update.js');

var modal_store = require('stores/modal_store.js');
var ModalMixin = require('../mixins/modal_mixin.js');




var EditableForms = require('components/editable_forms/editable_forms.jsx');
var editable_forms_actions = require('actions/editable_forms_actions.js');
var editable_forms_store = require('stores/editable_forms_store.js');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
        modalIsOpen: modal_store.get_modal_visible(),
        formsIsEdit: editable_forms_store.get_forms_editable(),
        company_information: account_page_store.get_company_information(),
    }),
    modal_store, editable_forms_store,account_page_store/*observable store list*/);




var AccountInfo = React.createClass({
    mixins: [PureRenderMixin,RafBatchStateUpdateMixin,ModalMixin],

    startEdit: function(id) {
        return () => editable_forms_actions.start_edit(id);
    },
    endEdit: function() {
        editable_forms_actions.end_edit();
        account_page_actions.update_company_information(this.state.company_information.toJS());
    },
    toggleEdit: function(id) {
        if (!this.state.formsIsEdit.get(id)) {
            return () => editable_forms_actions.start_edit(id);
        } else {
            return () => editable_forms_actions.end_edit();
        }
    },
    updateFormElement: function(name) {
        return (value) => account_page_actions.update_form(name, value);
    },
    render () {
        console.log('render');
        var edit = this.state.formsIsEdit.get('informations');
        return (
            <div className='entire-width'>
                <div className='company-information w50pr '>
                    <h2 className='tt-n fs26 d-ib'>Информация о компании</h2>
                    <span className='d-ib'>
                        <i className='svg-icon_edit m0-15' onClick={this.toggleEdit('informations')}/>
                        <a className='fs13 m0-15  td-u ap-link d-ib' onClick={this.openModal('payment_information')} >Платежные реквизиты</a>
                    </span>
                        <table className='company-information__view-edit m10-0 w100pr'>
                            <tr>
                                <td>Название</td>
                                <td>
                                    <strong>
                                        <EditableForms
                                            className='w100pr'
                                            onChange={this.updateFormElement('name')}
                                            edit={edit}
                                            text={this.state.company_information.get('name')} />
                                    </strong>
                                </td>
                            </tr>
                            <tr>
                                <td>Сайт</td>
                                <td>
                                    <EditableForms
                                        className='w100pr'
                                        onChange={this.updateFormElement('site')}
                                        edit={edit}
                                        text={this.state.company_information.get('site')} />
                                </td>
                            </tr>
                            <tr>
                                <td>Комментарии об услугах</td>
                                <td className='lh1-4'>
                                    <EditableForms
                                        className='w100pr'
                                        onChange={this.updateFormElement('description')}
                                        edit={edit}
                                        type='textarea'
                                        text={this.state.company_information.get('description')} />
                                </td>
                            </tr>
                            <tr>
                                <td className='ta-c h50px' colSpan='2'>
                                    {edit && <button onClick={this.endEdit}>Сохранить</button>}
                                </td>
                            </tr>
                        </table>
                    <div className='fillial-company'>
                        <h3 className='fs20 fw-n bc-g bb-s'>Филиалы компании <i className='btn-question m0-10'/></h3>
                        <div className='grad-g p10 b1s bc-g br2'>
                            <span className='fw-b fs16'>1. </span> Проспект Маршала жукова 2/22 д 1 <i className='svg-icon_edit m0-5 f-r'/><i className='svg-icon_close m0-5 f-r'/>
                        </div>
                    </div>
                </div>
                <div className='your-manager w50pr'>
                    <h2 className='tt-n fs26'>Ваш личный менеджер</h2>
                </div>
                <Modal
                    isOpen={!!this.state.modalIsOpen.get('payment_information')}
                    onRequestClose={this.handleModalCloseRequest}
                >
                    <div className='sign-in autoparts'>
                        <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                        <h2>Вход</h2>
                        <label className='new_context'>
                            E-mail
                            <input type='text' name='email'/>
                        </label>

                        <button className='m15-0' name='signin'>Войти</button>

                    </div>
                </Modal>
            </div>
        );
    }
});

module.exports = AccountInfo;
