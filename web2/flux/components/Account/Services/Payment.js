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
  selectedServices: ServicesStore.getSelectedServices(),
  subscribeWordsChecked: ServicesStore.getSubscribeWordsChecked(),
  isDiscount: ServicesStore.getDiscount(),
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
    const code = React.findDOMNode(this.refs.codePayment).value;
    let paymentStats = this.props.selectedServices.toJS();
    paymentStats.wholesale.words = this.props.subscribeWordsChecked.toJS();
    ServicesActions.make_payment(paymentStats,this.props.currentPaymentMethod.toJS(), code);
  }
  checkCodePayment() {
    const code = React.findDOMNode(this.refs.codePayment).value;
    ServicesActions.checkCodePayment(code);
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
    /*Тут нужно было бы досчитать сумму, но лень пробрасывать ту грязь что в другом компоненте, да и сумма нужно только для блокирования кнопки*/
    let summ = this.props.selectedServices.get('catalog').get('price') +
      this.props.selectedServices.get('autoservices').get('price') +
      this.props.selectedServices.get('autoparts').get('price') +
      this.props.selectedServices.get('wholesale').get('month') +
      this.props.selectedServices.get('pricemore').get('price');
    // console.log(typeof summ );
    return (
      <div className={cx('ta-C m20-0 fs18')}>
        {paymentMethod()}
        <button disabled={(summ === 0) && true} className='h35px grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0 z-depth1 va-M' onClick={this.onSubmitPayment}>Оплатить</button>
        <input ref="codePayment" className={cx('w200px va-M mL20 mR10 fs11', this.props.isDiscount && 'bc-green-500 b1s')} type="text" placeholder="Промо-код" />
        <button onClick={::this.checkCodePayment} className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0 z-depth1 h35px va-M'>Пересчитать</button>
      </div>
    );
  }
}

export default Payment;
