/*Vendor*/
import React, {Component, PropTypes} from 'react/addons';
import cx from 'classnames';
import immutable from 'immutable';

/*Decorator*/
import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

/*Component*/
import EditableForms from 'components/editable_forms/editable_forms.jsx';
import Modal from 'components/modal/index';

/*Action*/
import ModalActions from 'actions/ModalActions.js';
import ToggleActions from 'actions/ToggleActions.js';
import ServicesActions from 'actions/admin/services_actions.js';


/*Store*/
import ModalStore from 'stores/ModalStore.js';
import ToggleStore from 'stores/ToggleStore.js';
import ServicesStore from 'stores/admin/services_store.js';

/*Util*/
import autobind from 'utils/autobind.js';
import decOfNum from 'utils/DeclineOfNumber.js';
function decOfNumMonth(val) {
  return decOfNum(val, ['Месяц', 'Месяца', 'Месяцев']);
}
import formatString from 'utils/format_string.js';


@rafStateUpdate(() => ({
  tarifs: ServicesStore.getTarifs(),
  brandsGroupByRegion: ServicesStore.getBrandsGroupByRegion(),
  servicesGroupByType: ServicesStore.getServicesGroupByType(),
  selectedServices: ServicesStore.getSelectedServices(),
  selectBrands: ServicesStore.getSelectBrands(),
  selectServices: ServicesStore.get_select_services(),
  masterName: ServicesStore.get_masters_name(),
  modalIsOpen: ModalStore.getModalIsOpen(),
  toggle: ToggleStore.getToggle()
}), ModalStore, ToggleStore, ServicesStore)
class CompanyFilial extends Component {
  constructor(props) {
    super(props);
    autobind(this);
  }
  onChangeToggle(val) {
    ToggleActions.change(val);
  }
  onClickOpenModal(modalId, elementId) {
    ModalActions.openModal(modalId);
  }
  onClickCloseModal() {
    ModalActions.closeModal();
  }
  onChangeMasterName(e) {
    ServicesActions.changeMasterName(e.target.value);
  }
  onSubmitMasterName(val) {
    let save = !React.findDOMNode(this.refs.masterName).disabled;
    ToggleActions.change(val);
    if (save) {
      ServicesActions.submitMasterName(this.props.masterName.first());
    }
  }
  onChangeTarif(id, val) {
    ServicesActions.changeTarif(id, val.target.value);
  }
  onChangeBrands(e) {
    // Стэйт не меняем после каждого изменения
    ServicesActions.change_brands(e.target.value, e.target.checked);
  }
  onChangeServices(e) {
    // Стэйт не меняем после каждого изменения
    ServicesActions.change_services(e.target.value, e.target.checked);
  }
  onSubmitSelectBrands() {
    // Так как не меняем стетй. Берем из сторы новый набор данных
    ServicesActions.submitCheckbox('brands', ServicesStore.getSelectBrands().toJS().toString());
  }
  onSubmitSelectServices() {
    // Так как не меняем стетй. Берем из сторы новый набор данных
    ServicesActions.submitCheckbox('services', ServicesStore.get_select_services().toJS().toString());
  }
  render() {
    let brandsList = () => {
      let brands = {};
      this.props.selectBrands.forEach((v) => {
        brands[v] = v;
      });
      let list = this.props.brandsGroupByRegion
        .flatMap((part, index) =>
          part.get('brands')
            .filter(brand => brands[brand.get('id')])
            .map((brand) => (
              <li className='mR15' key={brand.get('id')}>
                {brand.get('name')}
              </li>
            )));
      if (list.size === 0) {
        list = (
          <li className='mR15 fw-b' key={0}>
            Выберите марки
          </li>
        );
        return list;
      }
      return list.toArray();
    };
    let servicesList = () => {
      let services = {};
      this.props.selectServices.forEach((v) => {
        services[v] = v;
      });
      let list = this.props.servicesGroupByType
        .flatMap((part, index) =>
          part.get('services')
            .filter(service => services[service.get('id')])
            .map((service) => (
              <li className='mR15' key={service.get('id')}>
                {service.get('name')}
              </li>
            )));
      if (list.size === 0) {
        list = (
          <li className='mR15 fw-b' key={0}>
            Выберите услуги
          </li>
        );
        return list;
      }
      return list.toArray();
    };
    let tarifs = (type) => {
      return this.props.tarifs.get(type)
        .map((part, index) => {
          index = index | 0;
          return (
            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(index === 0) && true} type="radio" value={index} onChange={this.onChangeTarif.bind(null, type)} className="radio m0-10" name={type}/>
              <span className="d-ib va-M lh1-4 fs15">
                {(index === 0) ?
                  'Бесплатно'
                  :
                  <span>
                    <span>
                      {decOfNumMonth(part.get('month'))}
                      <br/>
                      {formatString.money(part.get('price'), ' ')} руб.
                    </span>
                    <br/>
                    <span className="fs15 c-r">скидка - {part.get('discount')}%</span>
                  </span>
                }
              </span>
            </label>
          );
        }).toArray();
    };
    let servicesCheckbox = () => {
      let services = this.props.selectServices;
      this.props.selectServices.forEach((v) => {
        services[v] = v;
      })
      return this.props.servicesGroupByType
        .map((part, index) => {
          return (
            <div key={index}>
              {part.get('service_name')}
              <hr className='hr'/>
              {part.get('services').map((service) => {
                return (
                  <label key={service.get('id')} className="label--checkbox">
                    <input
                      value={service.get('id')}
                      defaultChecked={!!(services[service.get('id')])}
                      type="checkbox"
                      onChange={this.onChangeServices}
                      className="checkbox"/>
                    {service.get('name')}
                  </label>
                );
              }).toArray()}
            </div>
          );
        }).toArray();
    };
    let brandsCheckbox = () => {
      let brands = {};
      this.props.selectBrands.forEach((v) => {
        brands[v] = v;
      });
      return this.props.brandsGroupByRegion
        .map((part, index) => {
          return (
            <div key={index}>
              {part.get('region_name')}
              <hr className='hr'/>
              {part.get('brands')
                .map((brand) => {
                  return (
                    <label key={brand.get('id')} className="label--checkbox">
                      <input
                        value={brand.get('id')}
                        defaultChecked={!!(brands[brand.get('id')])}
                        type="checkbox"
                        onChange={this.onChangeBrands}
                        className="checkbox"/>
                      {brand.get('name')}
                    </label>
                  )
                }).toArray()
              }
            </div>
          )
        })
        .toArray();
    };
    let editMasterName = (this.props.masterName.first() === '') ?
                          !this.props.toggle.get('masterName'):
                          this.props.toggle.get('masterName');
    let summ = this.props.selectedServices.get('catalog').get('price') +
      this.props.selectedServices.get('autoservices').get('price') +
      this.props.selectedServices.get('autoparts').get('price');
    return (
      <div>
        <div className="br6 b1s bc-g grad-g">
          <div
            onClick={this.onChangeToggle.bind(null, 'servicesAutoservices')}
            className={cx('grad-as-no-hover p10-15 fw-b fs15 br6 entire-width cur-p', !!this.props.toggle.get('servicesAutoservices') && 'bBLr0 bBRr0')}
          >
            <div>
              Повышение в поиске в разделе "Консультация мастера"
            </div>
            <div>
              {(this.props.selectedServices.get('autoservices').get('price') === 0) ?
                <span className="fw-n fs14">Бесплатно</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('autoservices').get('month'))} - <strong>{this.props.selectedServices.get('autoservices').get('price')} руб.</strong>
                </span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('servicesAutoservices') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('servicesAutoservices') && 'd-N')}>
            Заполните сначала обслуживаемые в вашем салоне <strong>марки автомобилей</strong> и
            <strong>виды предоставляемых услуг</strong>, a затем выберите подходящий вам тариф:
            <div>
              <button
                className={cx('p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px', !!editMasterName && 'grad-ap c-white')}
                onClick={this.onSubmitMasterName.bind(null, 'masterName')}
              >
                {(!!editMasterName) ? 'Сохранить' : 'Имя мастера'}
              </button>
              <div className='new_context m30-0'>
                <input ref='masterName'
                  className={cx('bgc-t b1s bc-g', !editMasterName && 'input-as-text')}
                  disabled={!editMasterName}
                  type='text'
                  value={this.props.masterName.first()}
                  onChange={this.onChangeMasterName}
                  placeholder='Введите имя мастера'/>
              </div>
              <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px" onClick={this.onClickOpenModal.bind(null, 'account_services-brands')}>Марки автомобилей</button>
              <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  {brandsList()}
              </ul>

              <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px" onClick={this.onClickOpenModal.bind(null, 'account_services-services')}>Виды услуг</button>
              <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  {servicesList()}
              </ul>
            </div>
            <div className="entire-width flex-ai-c">
                 {tarifs('autoservices')}
            </div>
          </div>
        </div>
        <Modal
          isOpen={!!this.props.modalIsOpen.get('account_services-brands')}
          onRequestClose={this.onClickCloseModal}
        >
          <div className='ReactModal__Content-close flaticon-close' onClick={this.onClickCloseModal}></div>
          <div style={{'width': '400px', 'height': '500px', 'overflow' : 'auto'}}>
            {brandsCheckbox()}
          </div>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' onClick={this.onSubmitSelectBrands}>Сохранить</button>
        </Modal>
        <Modal
          isOpen={!!this.props.modalIsOpen.get('account_services-services')}
          onRequestClose={this.onClickCloseModal}
        >
          <div className='ReactModal__Content-close flaticon-close' onClick={this.onClickCloseModal}></div>
          <div style={{'width': '400px', 'height': '500px', 'overflow' : 'auto'}}>
            {servicesCheckbox()}
          </div>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0 z-depth1' onClick={this.onSubmitSelectServices}>Сохранить</button>
        </Modal>
        <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'autoparts')}
            className={cx('grad-ap-no-hover p10-15 fw-b fs15 br6 entire-width c-wh cur-p', !!this.props.toggle.get('autoparts') && 'bBLr0 bBRr0')}
          >
            <div>
              Повышение в поиске прайсов автозапчастей
            </div>
            <div>
              {(this.props.selectedServices.get('autoparts').get('price') === 0) ?
                <span className="fw-n fs14">Бесплатно</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('autoparts').get('month'))} - <strong>{this.props.selectedServices.get('autoparts').get('price')} руб.</strong></span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('autoparts') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('autoparts') && 'd-N')}>
            Возможность размещения на сайте ваших товаров в течении определенного срока:
            <div className="entire-width mT20  flex-ai-c">
                {tarifs('autoparts')}
            </div>
          </div>
        </div>
        <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'catalog')}
            className={cx('grad-w-no-hover p10-15 fw-b fs15 br6 entire-width bc-g cur-p', !!this.props.toggle.get('catalog') && 'bBLr0 bBRr0')}
          >
            <div>
              Повышение в поиске в каталоге компаний
            </div>
            <div>
              {(this.props.selectedServices.get('catalog').get('price') === 0) ?
                <span className="fw-n fs14">Бесплатно</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('catalog').get('month'))} - <strong>{this.props.selectedServices.get('catalog').get('price')} руб.</strong></span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('catalog') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('catalog') && 'd-N')}>
            Выберите срок отображения вашей компании в разделе "Каталог компаний":
            <div className="entire-width mT20  flex-ai-c">
              {tarifs('catalog')}
            </div>
          </div>
        </div>
        <hr className="hr-arrow m20-0"/>
        <div className='ta-C m20-0 fs18 '>
          Общая сумма: <strong>{formatString.money(summ, ' ')} </strong> руб.
        </div>
      </div>
    );
  }
}

export default CompanyFilial;
