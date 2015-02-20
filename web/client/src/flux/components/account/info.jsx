'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = require('immutable');
var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
Modal.setAppElement(appElement);

var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var modal_store = require('stores/modal_store.js');
var ModalMixin = require('../mixins/modal_mixin.js');

var EditableForms = require('components/editable_forms/editable_forms.jsx');
var editable_forms_actions = require('actions/editable_forms_actions.js');
var editable_forms_store = require('stores/editable_forms_store.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');
var Select = require('react-select');
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
		return ({ //state update lambda
			modalIsOpen         : modal_store.get_modal_visible(),
			formsIsEdit         : editable_forms_store.get_forms_editable(),
			company_information : account_page_store.get_company_information(),
			company_filials     : account_page_store.get_company_filials(),
			current_filial      : account_page_store.get_current_filial(),
		})
	},
	modal_store, editable_forms_store, account_page_store/*observable store list*/);

var Snackbar = require('components/snackbar/snackbar.jsx');
var route_actions = require('actions/route_actions.js');

var FilialAddressSelector = require('components/account/filial_address_selector.jsx');
var AccountInfo = React.createClass({
	mixins : [
		PureRenderMixin,
		RafBatchStateUpdateMixin,
		ModalMixin
	],

	startEdit         : function (id) {
		return () => editable_forms_actions.start_edit(id);
	},
	endEdit           : function () {
		editable_forms_actions.end_edit();
		account_page_actions.update_company_information(this.state.company_information.toJS());
	},
	toggleEdit        : function (id) {
		return () => (!this.state.formsIsEdit.get(id)) ?
			editable_forms_actions.start_edit(id) :
			editable_forms_actions.end_edit();
	},
	updateFormElement : function (name) {
		return (value) => account_page_actions.update_form(name, value);
	},
	extOpenModal(id_modal, id_element) {
		return () => {
      if (id_element !== 'new') {
        account_page_actions.change_current_filial(id_element);
      } else {
        account_page_actions.new_filial();
      }
      this.openModal(id_modal)();
    }
	},

	deleteFilial : function (id_filial) {

		return () => {
			account_page_actions.delete_filial(id_filial);
		}
	},
	btnChange    : function (name) {
		this.refs.snack.show();
	},
  updateValue: function(newValue) {
    console.log(newValue);
  },
	render() {
		var edit = this.state.formsIsEdit.get('informations');
		var Filial = this.state.company_filials &&
			this.state.company_filials
				.map((part, part_index) => {
          return (
						<div key={part.get('id')} className='grad-g p8 m10-0 b1s bc-g br2 entire-width'>
							<span>
								<span className='fw-b fs16 ta-r d-ib w25px'>{part_index + 1 + '.'}</span> {part.get('street') + ' ' + part.get('house')}
                                {(part.get('filial_type_id') == 1) ?
	                                <i className='svg-icon_gear m0-10 va-m fs16'/>
	                                :
	                                <i className='svg-icon_key m0-10 va-m fs16'/>
	                                }
							</span>
							<span>
								<i className='svg-icon_edit-grey m0-5 va-m'  onClick={this.extOpenModal('edit_company_filial', part.get('id'))}/>
								<i className='svg-icon_close-red m0-5 va-m' onClick={this.deleteFilial(part.get('id'))}/>
							</span>
						</div>
					)
				})
				.toJS();
    var rtn =
          [
            {value  : 'australian-capital-territory',
              label : 'Australian Capital Territory'
            },
            {value  : 'new-south-wales',
              label : 'New South Wales'
            },
            {value  : 'victoria',
              label : 'Victoria'
            },
            {value  : 'queensland',
              label : 'Queensland'
            },
            {value  : 'western-australia',
              label : 'Western Australia'
            },
            {value  : 'south-australia',
              label : 'South Australia'
            },
            {value  : 'tasmania',
              label : 'Tasmania'
            },
            {value  : 'northern-territory',
              label : 'Northern Territory'
            }
          ]
      ;
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
              <td>Телефон</td>
              <td>
                <EditableForms
                  onChange={this.updateFormElement('phone')}
                  edit={edit}
                  text={this.state.company_information.get('phone')} />
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
						<h3 className='fs20 fw-n bc-g bb-s pb5'>Филиалы компании
							<i className='btn-question m0-10'/>
						</h3>
                        {Filial}
						<button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.extOpenModal('edit_company_filial', 'new')}>Новый филиал</button>
					</div>
				</div>
				<div className='your-manager w50pr'>
					<h2 className='tt-n fs26'>Ваш личный менеджер</h2>
					<div className='p15 br10 bs  new_context m30-0'>
						<img className='va-t f-l mr20' src='/assets/images/templates/frank.jpg'/>
						<div className='fw-b fs18'>Фрэнк Галлагер</div>
						<div className='m15-0'>
							<strong>На связи с 10:00 до 10:30</strong>
							<span> в рабочие дни</span>
						</div>
						<div className='m15-0 lh1-8'>
							8 (812) 123-45-67 (доб 21)
							<br/>
							8 (812) 123-45-67 (доб 21)
						</div>
						<div className='td-u ap-link'>
							mail@mail.ru
						</div>
					</div>

          <Select options={rtn} readonly={true} value={'dwdw'}  onChange={this.updateValue} />
				</div>
				<Modal
					isOpen={!!this.state.modalIsOpen.get('payment_information')}
					onRequestClose={this.handleModalCloseRequest}
				>
					<div className='aa'>
                    {/*Для активной кнопки передать значение selected в класс кнопки*/}
						<ButtonGroup onChange={this.btnChange}>
							<button className='btn-bg-group w160px' value={1}>
								<i className='svg-icon_gear mr5 va-m fs16'/>
								Автозапчасти</button>
							<button className='btn-bg-group w160px' value={2}>
								<i className='svg-icon_key mr5 va-m fs16'/>
								Сервис</button>
						</ButtonGroup>
						<div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
						<h2>Вход</h2>
						<label className='new_context'>
							E-mail
							<input type='text' name='email' value={this.state.current_filial}/>
						</label>

						<button className='m15-0' name='signin'>Войти</button>

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
