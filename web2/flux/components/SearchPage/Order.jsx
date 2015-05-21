/*Vendor*/
import React, {Component, PropTypes} from 'react/addons';
import cx from 'classnames';
import Immutable from 'immutable';

/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

/*Component*/
import Modal from 'components/modal/index';

/*Action*/
import ModalActions from 'actions/ModalActions.js';
import searchOrderActions from 'actions/searchOrderActions.js';


/*Store*/
import modalStore from 'stores/ModalStore.js';
import searchOrderStore from 'stores/searchOrderStore.js';

/*Utils*/
import autobind from 'utils/autobind.js';

@rafStateUpdate(() => ({
  modalIsOpen: modalStore.getModalIsOpen(),
  orderFieldValidation: searchOrderStore.getOrderFieldValidation(),
  orderField: searchOrderStore.getOrderField(),
}), modalStore, searchOrderStore)
class Order extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  onSubmit() {
    let order = {
      sender: {
        name: React.findDOMNode(this.refs.name).value,
        email: React.findDOMNode(this.refs.email).value,
        phone: React.findDOMNode(this.refs.phone).value,
        comment: React.findDOMNode(this.refs.comment).value,
      },
      subject: this.props.item.toJS(),
      companyRecipientId: this.props.item.get('user_id'),
      servicesId: this.props.type
    };
    searchOrderActions.submit(order);
  }
  onClickCloseModal() {
    searchOrderActions.resetValidation();
    this.props.onClickCloseModal();
  }
  render() {
    return (
      <Modal
        isOpen={!!this.props.modalIsOpen.get('order'+this.props.type)}
        onRequestClose={this.props.onClickCloseModal}
      >
        <div className='ta-C w300px'>
          <div className='ReactModal__Content-close btn-close' onClick={this.onClickCloseModal}></div>
          <h2 className='m15-0 mB20'>Оставить заявку</h2>
          <label>
            <span className='d-b m5-0 fs14'>Имя</span>
            <input
              className={cx('w100pr', this.props.orderFieldValidation.contains('name') && 'bs-error')}
              defaultValue={this.props.orderField.get('name')}
              ref="name"
              type="text"
            />
          </label>
          <label>
            <span className='d-b m5-0 fs14'>E-mail</span>
            <input
              className={cx('w100pr', this.props.orderFieldValidation.contains('email') && 'bs-error')}
              defaultValue={this.props.orderField.get('email')}
              ref="email"
              type="text"
            />
          </label>
          <label>
            <span className='d-b m5-0 fs14'>Телефон</span>
            <input
              className={cx('w100pr', this.props.orderFieldValidation.contains('phone') && 'bs-error')}
              defaultValue={this.props.orderField.get('phone')}
              ref="phone"
              type="text"
            />
          </label>
          <label>
            <span className='d-b m5-0 fs14'>Комментарий</span>
            <textarea
              className={cx('w100pr h80px', this.props.orderFieldValidation.contains('comment') && 'bs-error')}
              ref="comment"
            />
          </label>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' name='register' onClick={this.onSubmit}>Отправить</button>
        </div>
      </Modal>
    );
  }
}

module.exports = Order;

