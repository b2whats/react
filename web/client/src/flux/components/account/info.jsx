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

var ButtonGroup = require('components/forms_element/button_group.jsx');



var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({ //state update lambda
        modalIsOpen: modal_store.get_modal_visible('info'),
        formsIsEdit: editable_forms_store.get_forms_editable(),
        company_information: account_page_store.get_company_information(),
        company_filial: account_page_store.get_company_filial(),
        //current_filial: account_page_store.get_current_filial(),
    })},
        modal_store, editable_forms_store,account_page_store/*observable store list*/);





var AccountInfo = React.createClass({
    mixins: [PureRenderMixin,RafBatchStateUpdateMixin,ModalMixin],
    getInitialState () {
        console.log('init_info');
        return null
    },
    componentDidMount ()  {console.log('DID_mount')},
    componentWillMount () {
        var current_filial_id = '';
    },
    startEdit: function(id) {
        return () => editable_forms_actions.start_edit(id);
    },
    endEdit: function() {
        editable_forms_actions.end_edit();
        account_page_actions.update_company_information(this.state.company_information.toJS());
    },
    toggleEdit: function(id) {
       return () => (!this.state.formsIsEdit.get(id)) ? editable_forms_actions.start_edit(id) : editable_forms_actions.end_edit();
    },
    updateFormElement: function(name) {
        return (value) => account_page_actions.update_form(name, value);
    },
    extOpenModal: function(id_modal,id_element) {
        var self = this;
        return () => {
            self.current_filial_id = id_element;
            //account_page_actions.update_current_filial(id_element);
            self.openModal(id_modal)();
        }
    },
    btnChange: function(name) {
        return (el) => {console.log(name,el);};
    },
    render () {
        var self = this;
        console.log('render_info');
        var edit = this.state.formsIsEdit.get('informations');
        var Filial  = this.state.company_filial &&
            this.state.company_filial
                .map((part, part_index) => {
                    return (
                        <div key={part_index} className='grad-g p8 m10-0 b1s bc-g br2 entire-width'>
                            <span>
                                <span className='fw-b fs16 ta-r d-ib w25px'>{part_index + 1 + '.'}</span> {part.get('street') +' '+ part.get('house')}
                                {(part.get('filial_type_id') == 1) ?
                                    <i className='svg-icon_gear m0-10 va-m fs16'/>
                                    :
                                    <i className='svg-icon_key m0-10 va-m fs16'/>
                                }
                            </span>
                            <span>
                                <i className='svg-icon_edit-grey m0-5 va-m'  onClick={this.extOpenModal('edit_company_filial',part_index)}/><i className='svg-icon_close-red m0-5 va-m'/>
                            </span>
                        </div>
                    )
                })
                .toJS();
        console.log(this.state.company_filial);
        var current_filial = this.state.company_filial.find((element,index) => index === self.current_filial_id);
        console.log('current_filial', current_filial);
        return (
            <div className='entire-width'>
                <div className='company-information w50pr '>
                    <h2 className='tt-n fs26 d-ib'>Информация о компании</h2>
                    <span className='d-ib'>
                        <i className='svg-icon_edit-grey m0-15' onClick={this.toggleEdit('informations')}/>
                        <a className='fs13 m0-15  td-u ap-link d-ib' onClick={this.openModal('payment_information')} >Платежные реквизиты</a>
                    </span>
                        <table className='company-information__view-edit m10-0 w100pr'>
                            <tr>
                                <td>Название</td>
                                <td>
                                    <strong>
                                        <EditableForms
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
                                        onChange={this.updateFormElement('site')}
                                        edit={edit}
                                        text={this.state.company_information.get('site')} />
                                </td>
                            </tr>
                            <tr>
                                <td>Комментарии об услугах</td>
                                <td className='lh1-4'>
                                    <EditableForms
                                        onChange={this.updateFormElement('description')}
                                        edit={edit}
                                        type='textarea'
                                        text={this.state.company_information.get('description')} />
                                </td>
                            </tr>
                            <tr>
                                <td className='ta-c h60px p0' colSpan='2'>
                                    {edit && <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8' onClick={this.endEdit}>Сохранить</button>}
                                </td>
                            </tr>
                        </table>
                    <div className='filial-company'>
                        <h3 className='fs20 fw-n bc-g bb-s pb5'>Филиалы компании<i className='btn-question m0-10'/></h3>
                        {Filial}
                        <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0'>Новый филиал</button>
                    </div>
                </div>
                <div className='your-manager w50pr'>
                    <h2 className='tt-n fs26'>Ваш личный менеджер</h2>
                </div>
                <Modal
                    isOpen={!!this.state.modalIsOpen.get('payment_information')}
                    onRequestClose={this.handleModalCloseRequest}
                >
                    <div className='aa'>
                    {/*Для активной кнопки передать значение selected в класс кнопки*/}
                        <ButtonGroup onChange={this.btnChange('change')}>
                            <button className='btn-bg-group w160px selected' value='1'><i className='svg-icon_gear mr5 va-m fs16'/>Автозапчасти</button>
                            <button className='btn-bg-group w160px' value='2'><i className='svg-icon_key mr5 va-m fs16'/>Сервис</button>
                        </ButtonGroup>
                        <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                        <h2>Вход</h2>
                        <label className='new_context'>
                            E-mail
                            <input type='text' name='email'/>
                        </label>

                        <button className='m15-0' name='signin'>Войти</button>

                    </div>
                </Modal>
                <Modal
                    isOpen={!!this.state.modalIsOpen.get('edit_company_filial')}
                    onRequestClose={this.handleModalCloseRequest}
                >

                    {(!!this.state.modalIsOpen.get('edit_company_filial')) &&
                        <div className='sign-in autoparts'>
                            <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
                            <h2>Вход</h2>
                            <label className='new_context'>
                                E-mail
                                <input type='text' name='email' value={current_filial.get('id')}/>
                            </label>

                            <button className='m15-0' name='signin'>Войти</button>

                        </div>
                    }

                </Modal>
            </div>
        );
    }
});

module.exports = AccountInfo;
