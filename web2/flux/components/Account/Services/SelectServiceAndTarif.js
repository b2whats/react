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
import account_services_store from 'stores/admin/services_store.js';



/*Util*/
import autobind from 'utils/autobind.js';
import decOfNum from 'utils/DeclineOfNumber.js';
function decOfNumMonth(val) {
  return decOfNum(val, ['Месяц', 'Месяца', 'Месяцев']);
}
import formatString from 'utils/format_string.js';

@rafStateUpdate(() => ({
  tarifs: ServicesStore.getTarifs(),
  payment: account_services_store.get_services_info(),
  brandsGroupByRegion: ServicesStore.getBrandsGroupByRegion(),
  servicesGroupByType: ServicesStore.getServicesGroupByType(),
  selectedServices: ServicesStore.getSelectedServices(),
  selectBrands: ServicesStore.getSelectBrands(),
  isDiscount: ServicesStore.getDiscount(),
  selectServices: ServicesStore.get_select_services(),
  masterName: ServicesStore.get_masters_name(),
  subscribeWords: ServicesStore.getSubscribeWords(),
  subscribeWordsChecked: ServicesStore.getSubscribeWordsChecked(),
  subscribeMarkup: ServicesStore.getSubscribeMarkup(),
  modalIsOpen: ModalStore.getModalIsOpen(),
  toggle: ToggleStore.getToggle()
}), ModalStore, ToggleStore, ServicesStore) class CompanyFilial extends Component {
  constructor(props) {
    super(props);
    autobind(this);
    this.state = {masterName: ''};
  }

  componentWillReceiveProps(newProps) {
    this.setState({masterName: newProps.masterName.first()})
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
    this.setState({masterName: e.target.value});
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
    ServicesActions.submitCheckbox('brands', ServicesStore.getSelectBrands().filter(el => el != '').toJS().toString());
    this.onClickCloseModal();
  }

  onSubmitSelectServices() {
    // Так как не меняем стетй. Берем из сторы новый набор данных
    ServicesActions.submitCheckbox('services', ServicesStore.get_select_services().filter(el => el != '').toJS().toString());
    this.onClickCloseModal();
  }

  onChangeWords(e) {
    ServicesActions.change_words(e.target.value, e.target.checked);
  }

  onChangeSubscribeMarkup(e) {
    const idElement = Number(e.target.getAttribute('data-id'));
    ServicesActions.change_markup(idElement, e.target.value);
  }

  onSubmitSubscribe() {
    ServicesActions.submitSubscribe(this.props.subscribeWordsChecked.toJS(), this.props.subscribeMarkup);
  }

  getSubscribeWordsCheckbox(words) {
    const hasAllWords = this.props.subscribeWordsChecked.contains(9999);
    return words
      .map((part, index) =>
        <label key={part.get('id')}
               className={cx('label--checkbox w130px d-ib m5-0', (part.get('id') === 9999) && 'fw-b td-u')}>
          <input
            value={part.get('id')}

            checked={!!this.props.subscribeWordsChecked.contains(part.get('id'))}
            type="checkbox"
            /*disabled={(this.props.payment.get('wholesale')) || (part.get('id') !== 9999 && hasAllWords)}*/
            onChange={this.onChangeWords}
            className="checkbox"/>
          {(part.get('id') === 9999) ? 'Все марки' : part.get('word')}
        </label>
    );
  }

  render() {
    let cost = 0;
    const cnt = this.props.subscribeWordsChecked.size;
    if (this.props.subscribeWordsChecked.contains(9999)) {
      cost = 33000;
    } else {

      switch (true) {
        case cnt > 19:
          cost = 33000;
          break;
        case cnt > 12:
          cost = 18000;
          break;
        case cnt > 6:
          cost = 12000;
          break;
        case cnt > 3:
          cost = 8000;
          break;
        case cnt > 1:
          cost = 5000;
          break;
        case cnt > 0:
          cost = 2500;
          break;
      }
    }
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
              <input defaultChecked={type !== 'catalog' ? index === 0 : index === 1} type="radio" value={index}
                     onChange={this.onChangeTarif.bind(null, type)} className="radio m0-10" name={type}/>
              <span className="d-ib va-M lh1-4 fs15">
                {(index === 0) ?
                  'Не подключена'
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
    let tarifsSubscribe = (type) => {

      return this.props.tarifs.get(type)
        .map((part, index) => {
          index = index | 0;
          return (
            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(index === 0) && true} type="radio" value={index}
                     onChange={this.onChangeTarif.bind(null, type)} className="radio m0-10" name={type}/>
              <span className="d-ib va-M lh1-4 fs15">
                {(index === 0) ?
                  'Не подключена'
                  :
                  <span>
                    <span>
                      {decOfNumMonth(part.get('month'))}
                      <br/>
                      {formatString.money(cost * ((100 - part.get('discount')) / 100) * part.get('month'), ' ')} руб.
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
    let editMasterName = (this.props.masterName.first() === '' || !!this.props.toggle.get('masterName')) ?
      true :
      false;
    let subscribeCost = (this.props.selectedServices.get('wholesale').get('month') > 0 )
      ? cost * this.props.selectedServices.get('wholesale').get('month') : 0;
    let summ = this.props.selectedServices.get('catalog').get('price') +
      this.props.selectedServices.get('autoservices').get('price') +
      this.props.selectedServices.get('autoparts').get('price') +
      this.props.selectedServices.get('pricemore').get('price') +
      subscribeCost;
    if (this.props.isDiscount) {
      summ = summ * 90 / 100;
    }

    return (
      <div>
        <div className="br6 b1s bc-g grad-g">
          <div
            onClick={this.onChangeToggle.bind(null, 'servicesAutoservices')}
            className={cx('grad-as-no-hover p10-15 fw-b fs15 br6 entire-width cur-p', !!this.props.toggle.get('servicesAutoservices') && 'bBLr0 bBRr0')}
            >
            <div className="fs14">
              Повышение в поиске в разделе "Консультация мастера"
              <span className="fs12 fw-n"> (
                {(!!this.props.payment.get('autoservices')) ?
                  <span>Оплачено до <strong>{this.props.payment.get('autoservices')}</strong> <i
                    className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                  :
                  <span>Не подключена</span>
                }
                )</span>
            </div>
            <div>
              {(this.props.selectedServices.get('autoservices').get('price') === 0) ?
                <span className="fw-n fs14">Не подключена</span>
                :
                <span
                  className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('autoservices').get('month'))} - <strong>{this.props.selectedServices.get('autoservices').get('price')}
                  руб.</strong>
                </span>
              }
              <i
                className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('servicesAutoservices') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('servicesAutoservices') && 'd-N')}>
            Заполните сначала обслуживаемые в вашем салоне <strong>марки автомобилей</strong> и
            <strong> виды предоставляемых услуг</strong>, a затем выберите подходящий вам тариф:
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
                       value={this.state.masterName}
                       onChange={this.onChangeMasterName}
                       placeholder='Введите имя мастера'/>
              </div>
              <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px"
                      onClick={this.onClickOpenModal.bind(null, 'account_services-brands')}>Марки автомобилей
              </button>
              <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                {brandsList()}
              </ul>

              <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px"
                      onClick={this.onClickOpenModal.bind(null, 'account_services-services')}>Виды услуг
              </button>
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
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' onClick={this.onSubmitSelectBrands}>
            Сохранить
          </button>
        </Modal>
        <Modal
          isOpen={!!this.props.modalIsOpen.get('account_services-services')}
          onRequestClose={this.onClickCloseModal}
          >
          <div className='ReactModal__Content-close flaticon-close' onClick={this.onClickCloseModal}></div>
          <div style={{'width': '400px', 'height': '500px', 'overflow' : 'auto'}}>
            {servicesCheckbox()}
          </div>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0 z-depth1'
                  onClick={this.onSubmitSelectServices}>Сохранить
          </button>
        </Modal>

        <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'autoparts')}
            className={cx('grad-ap-no-hover p10-15 fw-b fs15 br6 entire-width c-wh cur-p', !!this.props.toggle.get('autoparts') && 'bBLr0 bBRr0')}
            >
            <div>
              Повышение в поиске прайсов автозапчастей
                <span className="fs12 fw-n"> (
                  {(!!this.props.payment.get('autoparts')) ?
                    <span>Оплачено до <strong>{this.props.payment.get('autoparts')}</strong> <i
                      className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                    :
                    <span>Не подключена</span>
                  }
                  )</span>
            </div>
            <div>
              {(this.props.selectedServices.get('autoparts').get('price') === 0) ?
                <span className="fw-n fs14">Не подключена</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('autoparts').get('month'))} - <strong>{this.props.selectedServices.get('autoparts').get('price')}
                  руб.</strong></span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('autoparts') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('autoparts') && 'd-N')}>
            Возможность повышения в поисковой выдаче по автозапчастям предложений вашей компании. Ваши предложения будут
            выше предложений тех компаний, которые не пользуются этой услугой.
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
              <span className="fs12 fw-n"> (
                {(!!this.props.payment.get('catalog')) ?
                  <span>Оплачено до <strong>{this.props.payment.get('catalog')}</strong> <i
                    className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                  :
                  <span>Не подключена</span>
                }
                )</span>
            </div>
            <div>
              {(this.props.selectedServices.get('catalog').get('price') === 0) ?
                <span className="fw-n fs14">Не подключена</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('catalog').get('month'))}
                  - <strong>{this.props.selectedServices.get('catalog').get('price')} руб.</strong></span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('catalog') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('catalog') && 'd-N')}>
            Возможность повышения в поисковой выдаче каталога компаний информации о вашей компании. Ваша компания будет
            выше тех компаний, которые не пользуются этой услугой. Просмотров будет в 15-20 раз больше. Услуга хорошо
            подходит под рекламу Акций или имиджевую рекламу.
            <div className="entire-width mT20  flex-ai-c">
              {tarifs('catalog')}
            </div>
          </div>
        </div>
        <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'pricemore')}
            className={cx('grad-w-no-hover p10-15 fw-b fs15 br6 entire-width bc-g cur-p', !!this.props.toggle.get('catalog') && 'bBLr0 bBRr0')}
            >
            <div>
              Безлимитная заливка собственного розничного прайса
              <span className="fs12 fw-n"> (
                {(!!this.props.payment.get('pricemore')) ?
                  <span>Оплачено до <strong>{this.props.payment.get('pricemore')}</strong> <i
                    className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                  :
                  <span>Не подключена</span>
                }
                )</span>
            </div>
            <div>
              {(this.props.selectedServices.get('pricemore').get('price') === 0) ?
                <span className="fw-n fs14">Не подключена</span>
                :
                <span className="fw-n fs14">{decOfNumMonth(this.props.selectedServices.get('pricemore').get('month'))}
                  - <strong>{this.props.selectedServices.get('pricemore').get('price')} руб.</strong></span>
              }
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('pricemore') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('pricemore') && 'd-N')}>
            Вы привыкли работать с собственным прайсом? Он у вас на порядок больше 3 тыс позиций? Подключите эту услугу
            и снимите все ограничения по заливке прайса в систему. Данная услуга, так же дает право подать заявку на
            настройку автоматического обновления вашего прайса в системе AutoGiper.ru.
            <div className="entire-width mT20  flex-ai-c">
              {tarifs('pricemore')}
            </div>
          </div>
        </div>

        <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'wholesale')}
            className={cx('grad-ap-no-hover p10-15 fw-b fs15 br6 entire-width c-wh cur-p', !!this.props.toggle.get('wholesale') && 'bBLr0 bBRr0')}
            >
            <div>
              Без прайса. Подписка на прайсы оптовиков
              <span className="fs12 fw-n"> (
                {(!!this.props.payment.get('wholesale')) ?
                  <span>Оплачено до <strong>{this.props.payment.get('wholesale')}</strong> <i
                    className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                  :
                  <span>Не подключена</span>
                }
                )</span>
            </div>
            <div>
              <i className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('wholesale') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('wholesale') && 'd-N')}>
            Возможность размещения оптового прайса с вашей наценкой от вашего имени в нашей поисковой выдаче в качестве
            рекламы. Выбрать оптовика, проставить вашу общую скидку на его прайс и проставить наценки в зависимости от
            ценовой категории товара вы можете в разделе Управление товарами/Создание прайс-листа на основе прайс-листа
            оптового поставщика.
            Выберите марки:
            <div className="mT10">
              {this.props.subscribeWords && this.getSubscribeWordsCheckbox(this.props.subscribeWords)}
            </div>
            <div className="m10">
              <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0 z-depth1'
                      onClick={this.onSubmitSubscribe}>Сохранить
              </button>
            </div>
            <div className="entire-width mT20  flex-ai-c">
              {tarifsSubscribe('wholesale')}
            </div>
          </div>
        </div>

        {/* <div className="br6 b1s bc-g grad-g m15-0">
          <div
            onClick={this.onChangeToggle.bind(null, 'describe_price')}
            className={cx('grad-as-no-hover p10-15 fw-b fs15 br6 entire-width cur-p', !!this.props.toggle.get('describe_price') && 'bBLr0 bBRr0')}
            >
            <div>
              Создание собственного прайса по выбранным маркам автомобилей
              <span className="fs12 fw-n"> (
                {(!!this.props.payment.get('subscribe_as')) ?
                  <span>Оплачено до <strong>{this.props.payment.get('subscribe_as')}</strong> <i
                    className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                  :
                  <span>Не подключена</span>
                }
                )</span>
            </div>
            <div>
              <i
                className={cx('btn-plus-minus btn-icon m0-5', !!this.props.toggle.get('describe_price') && 'active')}></i>
            </div>
          </div>
          <div className={cx('p20-15', !this.props.toggle.get('describe_price') && 'd-N')}>
            <div className="mB20">
              Консолидированный оптовый прайс в среднем дешевле чем розничные предложения рынка на 10 процентов. Это та
              цена на которую вы нацениваете.
            </div>
            <div className="m20-0">
              Выберите наценку:<br/>
              <span className="w150px d-ib">0-1000 руб.</span>
              <input
                className={cx('mL20 w50px')}
                type='text'
                data-id="0"
                value={this.props.subscribeMarkup.get(0)}
                onChange={this.onChangeSubscribeMarkup}
                placeholder='%'/> % <br/>
              <span className="w150px d-ib">1000-3000 руб.</span>
              <input
                className={cx('mL20 w50px')}
                type='text'
                data-id="1"
                value={this.props.subscribeMarkup.get(1)}
                onChange={this.onChangeSubscribeMarkup}
                placeholder='%'/> % <br/>
              <span className="w150px d-ib">3000-5000 руб.</span>
              <input
                className={cx('mL20 w50px')}
                type='text'
                data-id="2"
                value={this.props.subscribeMarkup.get(2)}
                onChange={this.onChangeSubscribeMarkup}
                placeholder='%'/> % <br/>
              <span className="w150px d-ib">5000 - 10000 руб.</span>
              <input
                className={cx('mL20 w50px')}
                type='text'
                data-id="3"
                value={this.props.subscribeMarkup.get(3)}
                onChange={this.onChangeSubscribeMarkup}
                placeholder='%'/> % <br/>
              <span className="w150px d-ib">10000-20000 руб.</span>
              <input data-id="4"
                     className={cx('mL20 w50px')}
                     type='text'
                     value={this.props.subscribeMarkup.get(4)}
                     onChange={this.onChangeSubscribeMarkup}
                     placeholder='%'/> % <br/>
              <span className="w150px d-ib">20000-50000 руб</span>
              <input data-id="5"
                     className={cx('mL20 w50px')}
                     type='text'
                     value={this.props.subscribeMarkup.get(5)}
                     onChange={this.onChangeSubscribeMarkup}
                     placeholder='%'/> % <br/>
              <span className="w150px d-ib">>50000 руб.</span>
              <input data-id="6"
                     className={cx('mL20 w50px')}
                     type='text'
                     value={this.props.subscribeMarkup.get(6)}
                     onChange={this.onChangeSubscribeMarkup}
                     placeholder='%'/> % <br/>
            </div>
            Выберите марки:
            <div className="mT10">
              {this.props.subscribeWords && this.getSubscribeWordsCheckbox(this.props.subscribeWords)}
            </div>
            <div className="m10">
              <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0 z-depth1'
                      onClick={this.onSubmitSubscribe}>Сохранить
              </button>
            </div>
            <div className="entire-width mT20  flex-ai-c">
              {tarifsSubscribe('subscribe')}
            </div>
          </div>
        </div>*/}

        <hr className="hr-arrow m20-0"/>
        <div className='ta-C m20-0 fs18 '>
          Общая сумма: <strong>{formatString.money(summ, ' ')} </strong> руб.
        </div>


      </div>
    );
  }
}

export default CompanyFilial;
