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



var account_services_actions = require('actions/admin/services_actions.js');
var account_services_store = require('stores/admin/services_store.js');
var region_store = require('stores/region_store.js');

var Select = require('react-select');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({
      payment : account_services_store.get_services_info(),
      step : account_services_store.get_step(),
      regions : region_store.get_region_list(),
      toggle : account_services_store.get_toggle(),
      selected_services : account_services_store.get_selected_services(),
      tarifs : account_services_store.get_tarifs()
    })
	},
	modal_store, account_services_store);



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
      account_services_actions.toggle(val);
    }
  },
  change_tarif(id) {
    return (val) => {
      account_services_actions.change_tarif(id,val.target.value);
    }
  },

	render() {
    var regions = [];
    this.state.regions.forEach((region) => {
      regions.push({
        value : region.get('translit_name'),
        label : region.get('title')
      });
    });
    var AutoServicesTarif = this.state.tarifs.get('autoservices') &&
      this.state.tarifs.get('autoservices')
        .map((part, part_index) => {
          console.log(typeof (part.get('month')));
          return (

            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(part_index == 0) && true} type="radio" value={part_index} onChange={this.change_tarif('autoservices')} className="radio m0-10" name="autoservices"/>
              <span className="d-ib va-m lh1-4 fs17">
                {(part_index == 0) ?
                  'Бесплатно'
                  :
                  <span>
                    <span>{part.get('month')} Месяца - {part.get('price')} руб.</span>
                    <br/>
                    <span className="fs15 c-r">скидка - 11%</span>
                  </span>
                }
              </span>
            </label>
          )
        })
        .toJS();
    var AutoPartsTarif = this.state.tarifs.get('autoparts') &&
      this.state.tarifs.get('autoparts')
        .map((part, part_index) => {
          return (
            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(part_index == 0) && true} type="radio" value={part_index} onChange={this.change_tarif('autoparts')} className="radio m0-10" name="autoparts"/>
              <span className="d-ib va-m lh1-4 fs17">
                {(part_index == 0) ?
                  'Бесплатно'
                  :
                  <span>
                    <span>{part.get('month')} Месяца - {part.get('price')} руб.</span>
                    <br/>
                    <span className="fs15 c-r">скидка - 11%</span>
                  </span>
                  }
              </span>
            </label>
          )
        })
        .toJS();
    var CatalogTarif = this.state.tarifs.get('catalog') &&
      this.state.tarifs.get('catalog')
        .map((part, part_index) => {
          return (
            <label key={part.get('month')} className="label-radio">
              <input defaultChecked={(part_index == 0) && true} type="radio" value={part_index} onChange={this.change_tarif('catalog')} className="radio m0-10" name="catalog"/>
              <span className="d-ib va-m lh1-4 fs17">
                {(part_index == 0) ?
                  'Бесплатно'
                  :
                  <span>
                    <span>{part.get('month')} Месяца - {part.get('price')} руб.</span>
                    <br/>
                    <span className="fs15 c-r">скидка - 11%</span>
                  </span>
                  }
              </span>
            </label>
          )
        })
        .toJS();
    var summ = this.state.selected_services.get('catalog').get('price') +
      this.state.selected_services.get('autoservices').get('price') +
      this.state.selected_services.get('autoparts').get('price');
		return (
			<div>
        <h3 className='fw-b fs20 m20-0'>Действующие услуги</h3>

        <div className="br8 b1s bc-g grad-g d-ib w300px mr20">
          <div className="bg-c-as p8-10 fs14 fw-b br6 brbl-n brbr-n entire-width flex-ai-c o1as">
            <div>
              Отображение компании в разделе<br/> "Консультация мастера"
            </div>
            <i className="btn-question btn-icon"></i>
          </div>
          <div className="m15 d-f h40px flex-ai-c fs15">
            {
              (!!this.state.payment.get('autoservices'))?
                <span>Оплачено до <strong>{this.state.payment.get('autoservices')}</strong> <i className="flaticon-calendar fs15 ml5 c-g"></i> </span>
                :
                <span>Бесплатное размещение</span>
            }
          </div>
        </div>

        <div className="br8 b1s bc-g grad-g d-ib w300px mr20">
          <div className="bg-c-ap p8-10 fs14 fw-b br6 brbl-n brbr-n entire-width flex-ai-c o1ap">
            <div className="c-wh">
              Функция<br/> "Размещение запчастей"
            </div>
            <i className="btn-question btn-icon"></i>
          </div>
          <div className="m15 d-f h40px flex-ai-c fs15">
            {
              (!!this.state.payment.get('autoparts'))?
                <span>Оплачено до <strong>{this.state.payment.get('autoparts')}</strong> <i className="flaticon-calendar fs15 ml5 c-g"></i> </span>
                :
                <span>Бесплатное размещение</span>
              }
          </div>
        </div>

        <div className="br8 b1s bc-g grad-g d-ib w300px mr20">
          <div className="bg-c-g p8-10 fs14 fw-b br6 brbl-n brbr-n entire-width flex-ai-c o1g">
            <div>
              Отображение компании в <br/> "Каталоге компаний"
            </div>
            <i className="btn-question btn-icon"></i>
          </div>
          <div className="m15 d-f h40px flex-ai-c fs15">
            {
              (!!this.state.payment.get('catalog'))?
                <span>Оплачено до <strong>{this.state.payment.get('catalog')}</strong> <i className="flaticon-calendar fs15 ml5 c-g"></i> </span>
                :
                <span>Бесплатное размещение</span>
              }
          </div>
        </div>

        <hr className="hr bw4 m25-0"/>
        <h3 className='fw-b fs20 m20-0'>Подключение услуг</h3>

        {(this.state.step == 0) &&
          <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.changeStep}>Подключить услуги</button>
        }
        {(this.state.step >= 1) &&
          <div>
            <strong>Шаг 1 </strong> из 3 .
            <h4 className="d-ib fs20 m0 fw-n">Выбор региона(ов)</h4>
            <Select className='m20-0' placeholder='Выберите регион' multi={true} options={regions} onChange={this.selectRegion} />
          </div>
        }
        {(this.state.step >= 2) &&
        <div>
          <div className='m30-0'>
            <hr className="hr-arrow m20-0"/>
            <div className='m30-0'>
              <strong>Шаг 2 </strong>
              из 3 .
              <h4 className="d-ib fs20 m0 fw-n">Выбор услуги и тарифа:</h4>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-as-no-hover p15 fw-b fs16 br6 brbl-n brbr-n entire-width">
              <div>
                Отображение компании в разделе "Консультация мастера"
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('autoservices').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">{this.state.selected_services.get('autoservices').get('month')} Месяц - <strong>{this.state.selected_services.get('autoservices').get('price')} руб.</strong></span>
                  }
                <i onClick={this.toggle('autoservices')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('autoservices')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={"p20-15 " + ((!!this.state.toggle.get('autoservices')) ? "" : "d-n")}>
              Заполните сначала обслуживаемые в вашем салоне <strong>марки автомобилей</strong> и <strong>виды предоставляемых услуг</strong>, a затем выберите подходящий вам тариф:
              <div>
                <button className="p8 br2 grad-w b0 btn-shad-b f-l mr25 w170px">Марки автомобилей</button>
                <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  <li className="mr15 fw-b">Вся Америка</li>
                </ul>

                <button className="p8 br2 grad-w b0 btn-shad-b f-l mr25 w170px">Виды услуг</button>
                <ul className="br3 d-ib b1s bc-g p8-10 horizontal-list lst-d new_context m30-0">
                  <li className="mr15 fw-b">Вся Америка</li>
                </ul>
              </div>
              <div className="entire-width flex-ai-c">
                 {AutoServicesTarif}
              </div>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-ap-no-hover p15 fw-b fs16 br6 brbl-n brbr-n entire-width c-wh">
              <div>
                Размещение и отображение прайсов автозапчастей
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('autoparts').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">{this.state.selected_services.get('autoparts').get('month')} Месяц - <strong>{this.state.selected_services.get('autoparts').get('price')} руб.</strong></span>
                    }
                <i onClick={this.toggle('autoparts')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('autoparts')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={"p20-15 " + ((!!this.state.toggle.get('autoparts')) ? "" : "d-n")}>
              Возможность размещения на сайте ваших товаров в течении определенного срока:
              <div className="entire-width mt20  flex-ai-c">
                {AutoPartsTarif}
              </div>
            </div>
          </div>

          <div className="br6 b1s bc-g grad-g m20-0">
            <div className="grad-w-no-hover p15 fw-b fs16 br6 brbl-n brbr-n entire-width bc-g">
              <div>
                Отображение компании в каталоге компаний
                <i className="btn-question btn-icon m0-5"></i>
              </div>
              <div>
                  {
                    (this.state.selected_services.get('catalog').get('price') == 0)?
                      <span className="fw-n fs14">Бесплатно</span>
                      :
                      <span className="fw-n fs14">{this.state.selected_services.get('catalog').get('month')} Месяц - <strong>{this.state.selected_services.get('catalog').get('price')} руб.</strong></span>
                    }
                <i onClick={this.toggle('catalog')} className={"btn-plus-minus btn-icon m0-5 " + ((!!this.state.toggle.get('catalog')) ? "active" : "")}></i>
              </div>
            </div>
            <div className={"p20-15 " + ((!!this.state.toggle.get('catalog')) ? "" : "d-n")}>
              Выберите срок отображения вашей компании в разделе "Каталог компаний":
              <div className="entire-width mt20  flex-ai-c">
                {CatalogTarif}
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
			</div>
		);
	}
});

module.exports = AccountInfo;
