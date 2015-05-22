'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = window.imm = require('immutable');
var Modal = require('components/modal/index');
Modal.setAppElement(document.getElementById('react_main'));
var modal_store = require('stores/ModalStore.js');
var ModalMixin = require('../mixins/modal_mixin.js');


var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var decOfNum = require('utils/DeclineOfNumber.js');
var format_string = require('utils/format_string.js');
var cx = require('classnames');

var account_services_actions = require('actions/admin/services_actions.js');
var account_services_store = require('stores/admin/services_store.js');
var region_store = require('stores/region_store.js');

var toggle_actions = require('actions/ToggleActions.js');
var toggle_store = require('stores/ToggleStore.js');

var Select = require('react-select');

/*Component*/
import SelectServiceAndTarif from 'components/Account/Services/SelectServiceAndTarif';





var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
    return ({
      payment                : account_services_store.get_services_info(),
      payment_method         : account_services_store.get_payment_method(),
      current_payment_method : account_services_store.get_current_payment_method(),
      step                   : account_services_store.get_step(),
      regions                : region_store.get_region_list(),
      selected_services      : account_services_store.getSelectedServices(),
      masters_name           : account_services_store.get_masters_name(),
      tarifs                 : account_services_store.getTarifs(),
      modalIsOpen            : modal_store.getModalIsOpen(),
      brands_by_region       : account_services_store.getBrandsGroupByRegion(),
      services_by_type       : account_services_store.getServicesGroupByType(),
      select_brands          : account_services_store.getSelectBrands(),
      select_services        : account_services_store.get_select_services(),
      toggle                 : toggle_store.getToggle()
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
  toggle(val) {
    return (e) => {
      toggle_actions.change(val);
    }
  },
  generatePaymentBlock(type, css, title) {
    return (
      <div className={cx('br8 b1s bc-g grad-g d-ib mB15 mw250px', css !== 'g' && 'mR20')}>
        <div className={`bg-c-${css} p8-10 fs14 fw-b br6 bBLr0 bBRr0 entire-width flex-ai-c o1${css}`}>
          <div dangerouslySetInnerHTML={{__html: title}}>

          </div>

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
	render() {
    console.log(this.state.current_payment_method.size);

    var regions = [];
    this.state.regions.forEach((region) => {
      regions.push({
        value : region.get('id') + '',
        label : region.get('title')
      });
    });
		return (
			<div>
        <h3 className='fw-b fs20 m20-0'>Действующие услуги</h3>

        {this.generatePaymentBlock('autoservices','as','Повышение в поиске в разделе<br/>"Консультация мастера"')}
        {this.generatePaymentBlock('autoparts','ap','Повышение в поиске прайсов<br/>автозапчастей')}
        {this.generatePaymentBlock('catalog','g','Повышение в поиске в<br/>"Каталоге компаний"')}

        <hr className="hr bw4 m25-0"/>
        <h3 className='fw-b fs20 m20-0'>Подключение услуг</h3>

        {(this.state.step == 0) &&
          <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.changeStep}>Подключить услуги</button>
        }
        {(this.state.step == 0) &&
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
              <h4 className="d-ib fs20 m0 fw-n">Выбор услуги и тарифа:</h4>
            </div>
          </div>
          <SelectServiceAndTarif />




        </div>
        }

			</div>
		);
	}
});

module.exports = AccountInfo;
