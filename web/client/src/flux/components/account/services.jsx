'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = window.imm = require('immutable');
var Modal = require('components/modal/index');
Modal.setAppElement(document.getElementById('react_main'));
var modal_store = require('stores/modal_store.js');
var ModalMixin = require('../mixins/modal_mixin.js');


var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var decOfNum = require('utils/decline_of_number.js');
var cx = require('classnames');

var account_services_actions = require('actions/admin/services_actions.js');
var account_services_store = require('stores/admin/services_store.js');
var region_store = require('stores/region_store.js');

var toggle_actions = require('actions/toggle_actions.js');
var toggle_store = require('stores/toggle_store.js');

var Select = require('react-select');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({
      payment           : account_services_store.get_services_info(),
      step              : account_services_store.get_step(),
      regions           : region_store.get_region_list(),
      selected_services : account_services_store.get_selected_services(),
      masters_name : account_services_store.get_masters_name(),
      tarifs            : account_services_store.get_tarifs(),
      modalIsOpen       : modal_store.get_modal_visible(),
      brands_by_region  : account_services_store.get_brands_by_region(),
      services_by_type  : account_services_store.get_services_by_type(),
      select_brands  : account_services_store.get_select_brands(),
      select_services  : account_services_store.get_select_services(),
      toggle  : toggle_store.get_toggle(),
    })
  },
	modal_store, account_services_store, toggle_store);

function decOfNumMonth(val) {
  return decOfNum(val, ['Месяц', 'Месяца', 'Месяцев'])
}
var account_page_store = require('stores/account_page_store.js');


var AccountInfo = React.createClass({
	mixins : [
		PureRenderMixin,
		RafBatchStateUpdateMixin,
		ModalMixin
	],
  changeStep() {
    account_services_actions.change_step();
  },
  selectRegion(val) {
    console.log(val);
    //Запоминать регионы в стейте
    if (this.state.step < 2) {
      account_services_actions.change_step();
    }
  },
  makePayment() {
    account_services_actions.make_payment(this.state.selected_services.toJS());
  },
  toggle(val) {
    return () => {
      toggle_actions.change(val);
    }
  },
  extToggleSave(val) {
    return () => {
      var save = !this.refs.master_name.getDOMNode().disabled;
      this.toggle(val)();
      if (save) {
        account_services_actions.submit_masters_name(this.state.masters_name.first());
      }
    }
  },
  changeNameMaster(e) {
    account_services_actions.change_masters_name(e.target.value);
  },
  generateTarifs(type) {
    return this.state.tarifs.get(type)
        .map((part, part_index) => {
          return (

            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(part_index == 0) && true} type="radio" value={part_index} onChange={this.change_tarif(type)} className="radio m0-10" name={type}/>
              <span className="d-ib va-m lh1-4 fs17">
                {(part_index == 0) ?
                  'Бесплатно'
                  :
                  <span>
                    <span>{decOfNumMonth(part.get('month'))} {part.get('price')} руб.</span>
                    <br/>
                    <span className="fs15 c-r">скидка - {part.get('discount')}%</span>
                  </span>
                  }
              </span>
            </label>
          )
        })
        .toArray();
  },
  generatePaymentBlock(type, css, title) {
    return (
      <div className="br8 b1s bc-g grad-g d-ib w300px mR20">
        <div className={`bg-c-${css} p8-10 fs14 fw-b br6 bBLr0 bBRr0 entire-width flex-ai-c o1${css}`}>
          <div dangerouslySetInnerHTML={{__html: title}}>

          </div>
          <i className="btn-question btn-icon"></i>
        </div>
        <div className="m15 d-f h40px flex-ai-c fs15">
            {
              (!!this.state.payment.get(type))?
                <span>Оплачено до <strong>{this.state.payment.get(type)}</strong> <i className="flaticon-calendar fs15 mL5 c-g"></i> </span>
                :
                <span>Бесплатное размещение</span>
              }
        </div>
      </div>
    )
  },
  changeBrands(e) {
    //Стэйт не меняем после каждого изменения
    account_services_actions.change_brands(e.target.value,e.target.checked);
  },
  changeServices(e) {
    //Стэйт не меняем после каждого изменения
    account_services_actions.change_services(e.target.value,e.target.checked);
  },
  generatedBrandsCheckbox() {

    var brands = {};
    this.state.select_brands.forEach((v) => {
      brands[v] = v;
    });
    return this.state.brands_by_region
      .map((part, part_index) => {
        return (
          <div key={part_index}>
            {part.get('region_name')}
            <hr className='hr'/>
            {part.get('brands').map((brand) => {
              return (
                <label key={brand.get('id')} className="label--checkbox">
                  <input value={brand.get('id')} defaultChecked={!!(brands[brand.get('id')])} type="checkbox" onChange={this.changeBrands} className="checkbox"/>
                  {brand.get('name')}
                </label>
              )
            }).toArray()}
          </div>
        )
      })
      .toArray();
  },
  generatedBrandsList() {
    var brands = {};
    this.state.select_brands.forEach((v) => {
      brands[v] = v;
    });
    return this.state.brands_by_region
      .map((part, part_index) => {
        return (
            part.get('brands').map((brand) => {
              if (brands[brand.get('id')]) {
                return (
                  <li className='mR15' key={brand.get('id')}>
                    {brand.get('name')}
                  </li>
                )
              }
            }).toArray())
      })
      .toArray();
  },
  generatedServicesCheckbox() {
    console.log(this.state.select_services.toString());
    var services = this.state.select_services;



    return this.state.services_by_type
      .map((part, part_index) => {
        return (
          <div key={part_index}>
            {part.get('service_name')}
            <hr className='hr'/>
            {part.get('services').map((service) => {
              return (
                <label key={service.get('id')} className="label--checkbox">
                  <input value={service.get('id')} defaultChecked={services.find(v => v=== service.get('id'))} type="checkbox" onChange={this.changeServices} className="checkbox"/>
                  {service.get('name')}
                </label>
              )
            })}
          </div>
        )
      })

  },
  generatedServicesList() {
    var services = {};
    this.state.select_services.forEach((v) => {
      services[v] = v;
    });
    return this.state.services_by_type
      .map((part, part_index) => {
        return (
          part.get('services').map((service) => {
            if (services[service.get('id')]) {
              return (
                <li className='mR15' key={service.get('id')}>
                    {service.get('name')}
                </li>
              )
            }
          }).toArray())
      })
      .toArray();
  },
  change_tarif(id) {
    return (val) => {
      account_services_actions.change_tarif(id,val.target.value);
    }
  },
  submitSelectBrands() {
    //Так как не меняем стетй. Берем из сторы новый набор данных
    account_services_actions.submit_checkbox('brands',account_services_store.get_select_brands().toJS().toString());
  },
  submitSelectServices() {
    //Так как не меняем стетй. Берем из сторы новый набор данных
    account_services_actions.submit_checkbox('services',account_services_store.get_select_services().toJS().toString());
  },
	render() {
console.log(this.state.masters_name.first());
    var regions = [];
    this.state.regions.forEach((region) => {
      regions.push({
        value : region.get('id') + '',
        label : region.get('title')
      });
    });
    var summ = this.state.selected_services.get('catalog').get('price') +
      this.state.selected_services.get('autoservices').get('price') +
      this.state.selected_services.get('autoparts').get('price');
		return (
			<div>
        <h3 className='fw-b fs20 m20-0'>Действующие услуги</h3>

        {this.generatePaymentBlock('autoservices','as','Отображение компании в разделе<br/>"Консультация мастера"')}
        {this.generatePaymentBlock('autoparts','ap','Функция<br/>"Размещение запчастей"')}
        {this.generatePaymentBlock('catalog','g','Отображение компании в<br/>"Каталоге компаний"')}

        <hr className="hr bw4 m25-0"/>
        <h3 className='fw-b fs20 m20-0'>Подключение услуг</h3>

        {(this.state.step == 0) &&
          <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.changeStep}>Подключить услуги</button>
        }
        {(this.state.step >= 1) &&
          <div>
            <strong>Шаг 1 </strong> из 3 .
            <h4 className="d-ib fs20 m0 fw-n">Выбор региона(ов)</h4>
            <div id='select-regions'>
              <Select  className='m20-0' placeholder='Выберите регион' multi={true} options={regions} onChange={this.selectRegion} />
            </div>
          </div>
        }
        {(this.state.step >= 2) &&
        <div>
          <div className='m30-0'>
            <hr className="hr-arrow m20-0"/>
            <div className='m30-0'>
              <strong>Шаг 2 </strong> из 3.
              <h4 className="d-ib fs20 m0 fw-n">Выбор услуги и тарифа:</h4>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-as-no-hover p15 fw-b fs16 br6 bBLr0 bBRr0 entire-width">
              <div>
                Отображение компании в разделе "Консультация мастера"
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('autoservices').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">{decOfNumMonth(this.state.selected_services.get('autoservices').get('month'))} - <strong>{this.state.selected_services.get('autoservices').get('price')} руб.</strong></span>
                  }
                <i onClick={this.toggle('services_autoservices')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('services_autoservices')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={cx("p20-15", {"d-n": !!!this.state.toggle.get('services_autoservices')} )}>
              Заполните сначала обслуживаемые в вашем салоне <strong>марки автомобилей</strong> и <strong>виды предоставляемых услуг</strong>, a затем выберите подходящий вам тариф:
              <div>
                <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px" onClick={this.extToggleSave('master_name')}>{(!!this.state.toggle.get('master_name')) ? 'Сохранить' : 'Имя мастера'}</button>
                <div className="new_context m30-0">
                  <input ref='master_name'
                    className={cx("bgc-t b1s bc-g", {"input-as-text" : !!!this.state.toggle.get('master_name')})}
                    disabled={!!!this.state.toggle.get('master_name')} type='text'
                    value={this.state.masters_name.first()}
                    onChange={this.changeNameMaster}
                    placeholder='Введите имя мастера'/>
                </div>
                <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px" onClick={this.openModal('account_services-brands')}>Марки автомобилей</button>
                <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  {this.generatedBrandsList()}
                </ul>

                <button className="p8 br2 grad-w b0 btn-shad-b f-L mR25 w170px" onClick={this.openModal('account_services-services')}>Виды услуг</button>
                <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  {this.generatedServicesList()}
                </ul>
              </div>
              <div className="entire-width flex-ai-c">
                 {this.generateTarifs('autoservices')}
              </div>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-ap-no-hover p15 fw-b fs16 br6 bBLr0 bBRr0 entire-width c-wh">
              <div>
                Размещение и отображение прайсов автозапчастей
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('autoparts').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">{decOfNumMonth(this.state.selected_services.get('autoparts').get('month'))} - <strong>{this.state.selected_services.get('autoparts').get('price')} руб.</strong></span>
                    }
                <i onClick={this.toggle('autoparts')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('autoparts')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={"p20-15 " + ((!!this.state.toggle.get('autoparts')) ? "" : "d-n")}>
              Возможность размещения на сайте ваших товаров в течении определенного срока:
              <div className="entire-width mT20  flex-ai-c">
                {this.generateTarifs('autoparts')}
              </div>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-w-no-hover p15 fw-b fs16 br6 bBLr0 bBRr0 entire-width bc-g">
              <div>
                Отображение компании в каталоге компаний
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('catalog').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">
                        {decOfNumMonth(this.state.selected_services.get('catalog').get('month'))} -
                        <strong>{this.state.selected_services.get('catalog').get('price')} руб.</strong>
                      </span>
                    }
                <i onClick={this.toggle('catalog')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('catalog')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={"p20-15 " + ((!!this.state.toggle.get('catalog')) ? "" : "d-n")}>
              Выберите срок отображения вашей компании в разделе "Каталог компаний":
              <div className="entire-width mT20  flex-ai-c">
                {this.generateTarifs('catalog')}
              </div>
            </div>
          </div>
          <div className='ta-c m20-0 fs18 '>
            Общая сумма: <strong>{summ} </strong> руб.
          </div>
          <hr className="hr-arrow m20-0"/>
          <div className='ta-c m20-0 fs18 '>
            <button disabled={(summ == 0) && true}className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.makePayment}>Оплатить</button>
          </div>
        </div>
        }
        <Modal
          isOpen={!!this.state.modalIsOpen.get('account_services-brands')}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
          <div style={{'width': '400px', 'height': '500px', 'overflow' : 'auto'}}>
            {this.generatedBrandsCheckbox()}
          </div>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' onClick={this.submitSelectBrands}>Сохранить</button>
        </Modal>
        <Modal
          isOpen={!!this.state.modalIsOpen.get('account_services-services')}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className='ReactModal__Content-close btn-close' onClick={this.closeModal}></div>
          <div style={{'width': '400px', 'height': '500px', 'overflow' : 'auto'}}>
          {console.time('test')}
            {this.generatedServicesCheckbox()}
          {console.timeEnd('test')}
          </div>
          <button className='grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m20-0' onClick={this.submitSelectServices}>Сохранить</button>
        </Modal>
			</div>
		);
	}
});

module.exports = AccountInfo;
