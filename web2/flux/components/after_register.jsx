/*Vendor*/
import React, {Component, PropTypes} from 'react/addons';
import Link from 'components/link.jsx';
import cx from 'classnames';
import Immutable from 'immutable';


/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';




/*Component*/
import EditableForms from 'components/editable_forms/editable_forms.jsx';



/*Action*/
import account_page_actions from 'actions/account_page_actions.js';


/*Store*/
import account_page_store from 'stores/account_page_store.js';

@rafStateUpdate(() => ({
  companyInformation: account_page_store.get_company_information(),
}))
class Step1 extends Component {
  constructor(props) {
    super(props);
  }
  onCompanyInformationSubmit = () => {
    account_page_actions.update_company_information(account_page_store.get_company_information().toJS());
  }
  onCompanyInformationChange = (field) => (value) => {
    account_page_actions.update_form(field, value);
  }
  render() {
    return (
      <div className=''>
        <h2 className='tt-n fs26 d-ib'>Информация о компании</h2>
        <span className='d-ib'>
          <a className='fs13 m0-15  td-u ap-link d-ib'>Платежные реквизиты</a>
        </span>
        <table className='m10-0 w100pr T-p5-0'>
          <tr>
            <td className='va-T'>Название</td>
            <td>
              <strong>
                <EditableForms
                  className='w100pr'
                  onChange={this.onCompanyInformationChange('name')}
                  edit={true}
                  text={this.props.companyInformation.get('name')} />
              </strong>
            </td>
          </tr>
          <tr>
            <td className='va-T'>Сайт</td>
            <td>
              <EditableForms
                className='w100pr'
                placeholder='Введите название вашего сайта'
                onChange={this.onCompanyInformationChange('site')}
                edit={true}
                text={this.props.companyInformation.get('site')} />
            </td>
          </tr>
          <tr>
            <td className='va-T'>Телефон</td>
            <td>
              <EditableForms
                type='phone'
                className='w100pr'
                placeholder='Контактный телефон'
                onChange={this.onCompanyInformationChange('phone')}
                edit={true}
                text={this.props.companyInformation.get('phone')} />
            </td>
          </tr>
          <tr>
            <td className='va-b'>Комментарии об услугах</td>
            <td className='lh1-4'>
              <EditableForms
                className='w100pr h100px'
                placeholder='Описание компании'
                onChange={this.onCompanyInformationChange('description')}
                edit={true}
                type='textarea'
                text={this.props.companyInformation.get('description')} />
            </td>
          </tr>
          <tr>
            <td className='ta-R h60px p0' colSpan='2'>
              <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8' onClick={this.onCompanyInformationSubmit}>Сохранить</button>
            </td>
          </tr>
        </table>
      </div>
    )
  }
}



  let stepData = {
  1: {
    desc: 'Введите информацию о компании',
    component: <Step1/>
  },
  2: {
    desc: 'Добавьте информацию об адресах компании',
    component: <Step1/>
  }
}

function ext() {
  return function (target, key, descriptor) {
    var fn = descriptor.value;
    descriptor.value = function () {
      console.log(1, arguments);
      fn.apply(this, arguments);
    };
    return descriptor;
  }
}




export default class AfterRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
    };
    Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(x => x.startsWith('on'))
      .map(x => this[x] = this[x].bind(this));
  }

@ext()
  onStepChange(type)  {
    console.log(type);
    type === '+' && this.setState((state) => ({step: ++state.step}))
    type === '-' && this.state.step > 1 && this.setState((state) => ({step: --state.step}))
  }
  render() {
    let { step } = this.state;
    let stepDesc = stepData[step].desc;
    let stepComp = stepData[step].component;
    return (
      <div className='entire-width flex-ai-fs'>
        <div className='w48pr'>
          {stepComp}
        </div>
        <div className='w48pr z-depth1 p15 br3'>
          <h2 className='fs20 tt-n'>Шаг {step}</h2>
          <div className='m10-0'>
            {stepDesc}
          </div>
          <div className='entire-width mT30'>
            {step > 1 && <button onClick={this.onStepChange.bind(null,'-')} className="w80px p8 br2 grad-ap z-depth1 b0 ta-C c-white">Назад</button>}

            {!stepData[step + 1] ?
              <button className="p8-10 br2 grad-ap z-depth1 b0 ta-C c-white">Вернуться на главную</button>
              :
              <button onClick={this.onStepChange.bind(null,'+')} className="w80px p8 br2 grad-ap z-depth1 b0 ta-C c-white">Вперед</button>
            }
          </div>
        </div>

      </div>
    );
  }
}

