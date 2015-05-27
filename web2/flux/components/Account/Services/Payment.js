/*Vendor*/
import React, {Component, PropTypes} from 'react/addons';
import cx from 'classnames';

/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

/*Component*/

/*Action*/
import ServicesActions from 'actions/admin/services_actions.js';


/*Store*/
import ModalStore from 'stores/ModalStore.js';
import ServicesStore from 'stores/admin/services_store.js';

/*Util*/
import autobind from 'utils/autobind.js';
import decOfNum from 'utils/DeclineOfNumber.js';
function decOfNumMonth(val) {
  return decOfNum(val, ['Месяц', 'Месяца', 'Месяцев']);
}
import formatString from 'utils/format_string.js';


@rafStateUpdate(() => ({
  paymentMethod: ServicesStore.get_payment_method(),
  currentPaymentMethod: ServicesStore.get_current_payment_method(),
  selectedServices: ServicesStore.getSelectedServices()
}), ServicesStore)
class Payment extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }
  onChangePaymentMethod(e) {
    ServicesActions.change_payment_method(e.target.value,e.target.checked);
  }
  onSubmitPayment() {
    ServicesActions.make_payment(this.props.selectedServices.toJS(),this.props.currentPaymentMethod.toJS());
  }
  render() {
    let paymentMethod = () => (
      <ul className='lst-N ta-L fs14 pL0'>
        {this.props.paymentMethod
          .map((part, index) => (
            <li className='m15-0' key={index}>
              <span className='d-ib ta-C w80px mR10'>
                <img className='va-M' src={part.get('img')}/>
              </span>
              <label className="label-radio">
                <input value={index} name='payment_method' type="radio" onChange={this.onChangePaymentMethod} className="radio"/>
                  {part.get('name')}
              </label>
            </li>
          ))
          .toArray()
        }
      </ul>
    );
    let summ = this.props.selectedServices.get('catalog').get('price') +
      this.props.selectedServices.get('autoservices').get('price') +
      this.props.selectedServices.get('autoparts').get('price');
    // console.log(typeof summ );
    return (
      <div className={cx('ta-C m20-0 fs18')}>
        {paymentMethod()}
        <button disabled={(summ === 0 || this.props.currentPaymentMethod.size === 0) && true} className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0 z-depth1' onClick={this.onSubmitPayment}>Оплатить</button>
      </div>
    );
  }
}

export default Payment;
