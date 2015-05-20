
import React, {Component, PropTypes} from 'react/addons';
import Link from 'components/link.jsx';
import cx from 'classnames';
import Immutable from 'immutable';
const sc = require('shared_constants');

/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

/*Component*/
import EditableForms from 'components/editable_forms/editable_forms.jsx';
import CompanyFilial from 'components/Account/Company/CompanyFilial';
import SelectServiceAndTarif from 'components/Account/Services/SelectServiceAndTarif';

/*Action*/
import AccountPageActions from 'actions/account_page_actions.js';

/*Store*/
import AccountPageStore from 'stores/account_page_store.js';

/*Utils*/
import autobind from 'utils/autobind.js';
/home/w/PhpstormProjects/react/web2/flux/components/SearchPage

@rafStateUpdate(() => ({
  companyInformation: AccountPageStore.get_company_information()
}), AccountPageStore)
class Step1 extends Component {
  constructor(props) {
    super(props);
  }
  onSubmitCompanyInformation = () => {
    AccountPageActions.update_company_information(AccountPageStore.get_company_information().toJS());
  }
  onChangeCompanyInformation = (field) => (value) => {
    AccountPageActions.update_form(field, value);
  }


  render() {
    return (
      <div className=''>
        <h2 className='tt-n fs26 d-ib'>Информация о компании</h2>
        <table className='m10-0 w100pr T-p5-0'>
          <tr>
            <td className='va-T'>Название</td>
            <td>
              <strong>
                <EditableForms
                  className='w100pr'
                  onChange={this.onChangeCompanyInformation('name')}
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
                onChange={this.onChangeCompanyInformation('site')}
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
                onChange={this.onChangeCompanyInformation('phone')}
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
                onChange={this.onChangeCompanyInformation('description')}
                edit={true}
                type='textarea'
                text={this.props.companyInformation.get('description')} />
            </td>
          </tr>
          <tr>
            <td className='ta-R h60px p0' colSpan='2'>
              <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8' onClick={this.onSubmitCompanyInformation}>Сохранить</button>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}

let stepData = {
  1: {
    desc: 'Введите информацию о компании',
    component: <Step1 />
  },
  2: {
    desc: 'Добавьте информацию об адресах компании',
    component: <CompanyFilial />
  },
  3: {
    desc: 'Выберите услуги и тариф',
    component: <SelectServiceAndTarif />
  }
};


class AfterRegister extends Component {
  constructor(props) {
    super(props);
    autobind(this);
    this.state = {
      step: 1
    };
  }

  onChangeStep(type) {
    if (type === '+') this.setState((state) => ({step: ++state.step}));
    if (type === '-' && this.state.step > 1) this.setState((state) => ({step: --state.step}));
  }
  onClickChangeLocation() {

  }
  render() {
    let { step } = this.state;
    let stepDesc = stepData[step].desc;
    let stepComp = stepData[step].component;
    return (
      <div className='entire-width flex-ai-fs'>
        <div className='w68pr'>
          {stepComp}
        </div>
        <div className='w30pr z-depth1 p15 br3'>
          <h2 className='fs20 tt-n'>Шаг {step}</h2>
          <div className='m10-0'>
            {stepDesc}
          </div>
          <div className='entire-width mT30'>
            {step > 1 && <button onClick={this.onChangeStep.bind(null, '-')} className="w110px p8 br2 grad-ap z-depth1 b0 ta-C c-white"><i className="flaticon-left-arrow"/> Назад</button>}

            {!stepData[step + 1] ?
              <button onClick={this.onClickChangeLocation} className="p8-10 br2 grad-ap z-depth1 b0 ta-C c-white">Вернуться на главную</button>
              :
              <button onClick={this.onChangeStep.bind(null, '+')} className="w110px p8 br2 grad-as z-depth1 b0 ta-C c-white">Вперед <i className="flaticon-right-arrow"/> </button>
            }
          </div>
        </div>

      </div>
    );
  }
}

export default AfterRegister;
