'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var cx = require('classnames');
var info_image = require('images/templates/frank.jpg');
var Link = require('components/link.jsx');
var immutable = require('immutable');
var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
Modal.setAppElement(appElement);
var modal_store = require('stores/ModalStore.js');
var ModalMixin = require('../mixins/modal_mixin.js');

var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var CTG = React.addons.CSSTransitionGroup;
var EditableForms = require('components/editable_forms/editable_forms.jsx');
var editable_forms_actions = require('actions/editable_forms_actions.js');
var editable_forms_store = require('stores/editable_forms_store.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');
var Select = require('react-select');

/*Actions*/
import authAction from 'actions/auth_actions.js';

/*Stores*/
import authStore from 'stores/auth_store.js';

/*Component*/
import CompanyFilial from 'components/Account/Company/CompanyFilial';

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({ //state update lambda
      modalIsOpen: modal_store.getModalIsOpen(),
      formsIsEdit: editable_forms_store.get_forms_editable(),
      company_information: account_page_store.get_company_information(),
      company_personal_detail: account_page_store.get_company_personal_detail(),
      change_password_validation: authStore.get_change_password_validation(),
    })
  },
  modal_store, editable_forms_store, account_page_store, authStore/*observable store list*/);

var Snackbar = require('components/snackbar/snackbar.jsx');
var route_actions = require('actions/route_actions.js');

var FilialAddressSelector = require('components/account/filial_address_selector.jsx');
var AccountInfo = React.createClass({
  mixins: [
    PureRenderMixin,
    RafBatchStateUpdateMixin,
    ModalMixin
  ],

  startEdit: function (id) {
    return () => editable_forms_actions.start_edit(id);
  },
  endEdit: function () {
    editable_forms_actions.end_edit();
    // console.log(account_page_store.get_company_information().toJS());
    account_page_actions.update_company_information(account_page_store.get_company_information().toJS());
  },
  toggleEdit: function (id) {
    return () => (!this.state.formsIsEdit.get(id)) ?
      editable_forms_actions.start_edit(id) :
      editable_forms_actions.end_edit();
  },
  updateFormElement: function (name) {
    return (value) => account_page_actions.update_form(name, value);
  },
  btnChange: function (name) {
    this.refs.snack.show();
  },
  updateCompanyPersonalDetails(field) {
    return (e) => {
      var value = (typeof e == 'object') ? e.target.value : e;
      account_page_actions.update_company_personal_details(field, value);
    }
  },
  submitCompanyPersonalDetails(e) {
    e.preventDefault();
    account_page_actions.submit_company_personal_details(this.state.company_personal_detail.toJS());
  },
  test() {
    account_page_actions.testAsync();
  },
  submitChangePassword() {
    const password = {
      oldPassword: React.findDOMNode(this.refs.oldPassword).value,
      newPassword: React.findDOMNode(this.refs.newPassword).value
    }
    authAction.submitChangePassword(password);
  },
  render() {

    var edit = this.state.formsIsEdit.get('informations');
    return (
      <div className='entire-width'>
        <div className='company-information w50pr '>
          <h2 className='tt-n fs26 d-ib mR15'>Информация о компании</h2>
					<span className='d-ib'>
						<i className='svg-icon_edit-grey' onClick={this.toggleEdit('informations')}/>
						<a className='fs13 mL15  td-u ap-link d-ib' onClick={this.openModal('payment_information')}>Платежные
              реквизиты</a>
            <a className='fs13 mL15  td-u ap-link d-ib' onClick={this.openModal('changePassword')}>Изменить пароль</a>
					</span>
          <table className='company-information__view-edit m10-0 w100pr'>
            <tr>
              <td>Название</td>
              <td>
                <strong>
                  <EditableForms
                    className={cx({'input-as-text' : !edit})}
                    onChange={this.updateFormElement('name')}
                    edit={edit}
                    text={this.state.company_information.get('name')}/>
                </strong>
              </td>
            </tr>
            <tr>
              <td>Сайт</td>
              <td>
                <EditableForms
                  placeholder='Введите название вашего сайта'
                  className={cx({'input-as-text' : !edit})}
                  onChange={this.updateFormElement('site')}
                  edit={edit}
                  text={this.state.company_information.get('site')}/>
              </td>
            </tr>
            <tr>
              <td>Телефон</td>
              <td>
                <EditableForms
                  type='phone'
                  placeholder='Контактный телефон'
                  className={cx({'input-as-text' : !edit})}
                  onChange={this.updateFormElement('phone')}
                  edit={edit}
                  text={this.state.company_information.get('phone')}/>
              </td>
            </tr>
            <tr>
              <td>Комментарии об услугах</td>
              <td className='lh1-4'>
                <EditableForms
                  className={cx({'input-as-text' : !edit})}
                  placeholder='Описание компании'
                  onChange={this.updateFormElement('description')}
                  edit={edit}
                  type='textarea'
                  text={this.state.company_information.get('description')}/>
              </td>
            </tr>
            <tr>
              <td className='ta-C h60px p0' colSpan='2'>
                {edit &&
                <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8' onClick={this.endEdit}>Сохранить</button>}
              </td>
            </tr>
          </table>
          <CompanyFilial />
        </div>
        <div className='your-manager w50pr Mw500px'>
          <h2 className='tt-n fs26'>Ваш личный менеджер</h2>

          <div className='p15 br10 z-depth1  new_context m30-0'>
            <img className='va-T f-L mR20' src={info_image}/>

            <div className='new-context'>
              <div className='fw-b fs18'>Ваш менеджер</div>
              <div className='m15-0'>
                <strong>На связи с 10:30 до 17:30</strong>
                <span> в рабочие дни</span>
              </div>
              <div className='m15-0 lh1-8'>
                8 (499) 322-21-74
                <br/>
                8 (812) 407-26-09
              </div>
              <div className='td-u ap-link'>

              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('payment_information')}
          onRequestClose={this.handleModalCloseRequest}
          >
          <div className='ta-C w700px'>
            <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
            <h2 className='m15-0 mB25'>Реквизиты компании</h2>

            <form onSubmit={this.submitCompanyPersonalDetails} encType="application/x-www-form-urlencoded">
              <ButtonGroup className='m15-0'
                           select_element_value={this.state.company_personal_detail && this.state.company_personal_detail.get('type') || 'ИП'}
                           onChange={this.updateCompanyPersonalDetails('type')}>
                <button type='button' className="btn-bg-group w80px" value={'ИП'}>ИП</button>
                <button type='button' className="btn-bg-group w80px" value={'ООО'}>ООО</button>
                <button type='button' className="btn-bg-group w80px" value={'ЗАО'}>ЗАО</button>
                <button type='button' className="btn-bg-group w80px" value={'ОАО'}>ОАО</button>
              </ButtonGroup>

              <div>
                <div className='d-ib w50pr p10'>
                  <label>
                    <span className='d-b m5-0 fs14'>Полное наименование компании</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('name')}
                           onChange={this.updateCompanyPersonalDetails('name')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>ИНН</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('inn')}
                           onChange={this.updateCompanyPersonalDetails('inn')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>Юридический адрес</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('legal_address')}
                           onChange={this.updateCompanyPersonalDetails('legal_address')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>Банк</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('bank')}
                           onChange={this.updateCompanyPersonalDetails('bank')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>Расчетный счет</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('rs')}
                           onChange={this.updateCompanyPersonalDetails('rs')}/>
                  </label>
                </div>
                <div className='d-ib w50pr p10'>
                  <label>
                    <span className='d-b m5-0 fs14'>ОГРН</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('ogrn')}
                           onChange={this.updateCompanyPersonalDetails('ogrn')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>КПП</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('kpp')}
                           onChange={this.updateCompanyPersonalDetails('kpp')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>Фактический адрес</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('actual_address')}
                           onChange={this.updateCompanyPersonalDetails('actual_address')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>БИК</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('bik')}
                           onChange={this.updateCompanyPersonalDetails('bik')}/>
                  </label>
                  <label>
                    <span className='d-b m5-0 fs14'>Корреспондентский счет</span>
                    <input type='text'
                           className='w100pr'
                           defaultValue={this.state.company_personal_detail.get('ks')}
                           onChange={this.updateCompanyPersonalDetails('ks')}/>
                  </label>
                </div>
              </div>
              <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0'>Сохранить</button>
            </form>

          </div>
        </Modal>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('changePassword')}
          onRequestClose={this.handleModalCloseRequest}
          >
          <div className='ta-C w300px'>
            <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
            <h2 className='m15-0 mB25'>Изменить пароль</h2>
            <label>
              <span className='d-b m5-0 fs14'>Введите старый пароль</span>
              <input
                ref="oldPassword"
                type='password'
                className={cx({
                  'bs-error' : !!this.state.change_password_validation.has('oldPassword'),
                  'w100pr'   : true
                })}/>
            </label>
            <label>
              <span className='d-b m5-0 fs14'>Введите новый пароль</span>
              <input
                ref="newPassword"
                type='password'
                className={cx({
                  'bs-error' : !!this.state.change_password_validation.has('newPassword'),
                  'w100pr'   : true
                })}/>
            </label>
            <button onClick={this.submitChangePassword} className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0'>
              Сохранить
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('edit_company_filial')}
          onRequestClose={this.handleModalCloseRequest}
          >

          <FilialAddressSelector />


        </Modal>
        <Snackbar
          message="Event added to your calendar"
          action="undo"
          ref='snack'
          onActionTouchTap={this._handleAction}/>
      </div>
    );
  }
});

module.exports = AccountInfo;
