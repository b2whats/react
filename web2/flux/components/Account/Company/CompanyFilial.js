/*Vendor*/
import React, {Component, PropTypes} from 'react/addons';
import cx from 'classnames';

/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

/*Component*/
import EditableForms from 'components/editable_forms/editable_forms.jsx';
import Modal from 'components/modal/index';
import FilialAddressSelector from 'components/account/filial_address_selector.jsx';

/*Action*/
import AccountPageActions from 'actions/account_page_actions.js';
import ModalActions from 'actions/ModalActions.js';

/*Store*/
import AccountPageStore from 'stores/account_page_store.js';
import ModalStore from 'stores/ModalStore.js';

/*Util*/
import autobind from 'utils/autobind.js';

@rafStateUpdate(() => ({
  companyFilials: AccountPageStore.getCompanyFilials(),
  modalIsOpen: ModalStore.getModalIsOpen()
}), ModalStore, AccountPageStore)
class CompanyFilial extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }
  onClickDeleteFilial(filialId) {
    AccountPageActions.delete_filial(filialId);
  }
  onClickOpenModal(modalId, elementId) {
    if (elementId !== 'new') AccountPageActions.change_current_filial(elementId);
    else AccountPageActions.new_filial();

    ModalActions.openModal(modalId);
  }
  onClickCloseModal() {
    ModalActions.closeModal();
  }
  render() {
    let Filials = this.props.companyFilials
      .map((part, index) => {
        return (
          <div key={part.get('id')} className='grad-g p8 m10-0 br2 entire-width z-depth1'>
            <span>
              <span className='fw-b fs16 ta-R d-ib w25px'>{index + 1 + '.'}</span> {part.get('street') + ' ' + part.get('house')}
              <i className={cx('m0-10 va-M fs16', (part.get('filial_type_id') === 1) ? 'svg-icon_gear' : 'svg-icon_key')}/>
            </span>
            <span>
              <i className='flaticon-edit m0-5 va-M c-grey-400 H-cur-p H-c-grey-700' onClick={this.onClickOpenModal.bind(null, 'editCompanyFilial', part.get('id'))}/>
              <i className='flaticon-close m0-5 va-M c-red-500' onClick={this.onClickDeleteFilial.bind(null, part.get('id'))}/>
            </span>
          </div>
        );
      })
      .toArray();
    return (
      <div className='filial-company'>
        <h3 className='fs20 fw-n bc-g bB1s pB5 m10-0'>Филиалы компании
          <i className='btn-question btn-icon m0-10'/>
        </h3>
          {Filials}
        <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.onClickOpenModal.bind(null, 'editCompanyFilial', 'new')}>Новый филиал</button>
        <Modal
          isOpen={!!this.props.modalIsOpen.get('editCompanyFilial')}
          onRequestClose={this.onClickCloseModal}
        >
          <FilialAddressSelector />
        </Modal>
      </div>
    );
  }
}

export default CompanyFilial;
