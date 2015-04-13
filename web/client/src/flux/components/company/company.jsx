'use strict';

var React = require('react/addons');
var _ = require('underscore');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');
var immutable = require('immutable');
var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
Modal.setAppElement(appElement);

var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');

var modal_store = require('stores/modal_store.js');
var ModalMixin = require('../mixins/modal_mixin.js');

var EditableForms = require('components/editable_forms/editable_forms.jsx');
var editable_forms_actions = require('actions/editable_forms_actions.js');
var editable_forms_store = require('stores/editable_forms_store.js');
var personal_company_page_store = require('stores/personal_company_page_store.js');
var personal_company_page_actions = require('actions/personal_company_page_actions.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var account_page_actions = require('actions/account_page_actions.js');
var account_page_store = require('stores/account_page_store.js');
var region_store = require('stores/region_store.js');
var toggle_store = require('stores/toggle_store.js');
var toggle_actions = require('actions/toggle_actions.js');
var cx = require('classnames');



var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => {
		return ({ //state update lambda
      company_information : personal_company_page_store.get_company_information(),
      company_filials     : personal_company_page_store.get_company_filials(),
      region_current      : region_store.get_region_current(),
      toggle              : toggle_store.get_toggle(),
      new_comment :  personal_company_page_store.get_new_comment(),


})
	},
	toggle_store, region_store, personal_company_page_store/*observable store list*/);

var Snackbar = require('components/snackbar/snackbar.jsx');
var route_actions = require('actions/route_actions.js');

var FilialAddressSelector = require('components/account/filial_address_selector.jsx');

var YandexMap = require('components/yandex/yandex_map.jsx');

var ymap_baloon_template =  require('components/search_page/templates/yandex_baloon_template.jsx');
var ymap_cluster_baloon_template = require('../search_page/templates/yandex_cluster_baloon_template.jsx');
var yandex_templates_events = require('components/search_page/templates/yandex_templates_events.js');
var YandexMapMarker = require('components/yandex/yandex_map_marker.jsx');
var ButtonGroup = require('components/forms_element/button_group.jsx');

var AccountInfo = React.createClass({
	mixins : [
		PureRenderMixin,
		RafBatchStateUpdateMixin
	],
  toggle(val) {
    return (e) => {
      toggle_actions.change(val);
    }
  },
  noop() {
    console.log('noop');
  },
  updateFormElement: function(name) {
    return (e) => {
      var value = (_.isObject(e)) ? e.target.value : e;
      personal_company_page_actions.update_form(name, value);
    };
  },
	render() {
    console.log(this.state.new_comment.toJS());
    var bounds = [[59.744465,30.042834],[60.090935,30.568322]]; //определить например питером на случай если region_current не прогрузился
    if(this.state.region_current) {
      bounds = [this.state.region_current.get('lower_corner').toJS(), this.state.region_current.get('upper_corner').toJS()];
    }
    var YandexMarkers  = this.state.auto_part_markers &&
      this.state.auto_part_markers
        .filter( m => m.get('on_current_page') )
        .map(m =>
          <YandexMapMarker
            key={m.get('id')}
          {...m.toJS()} />)
        .toJS() || [];
    var operation_time = ['пн-пт', 'сб', 'вс'];
    var Filials = this.state.company_filials
      .map((part, part_index) => {
        return (
          <div  key={part.get('id')} className='grad-g p8 m10-0 b1s bc-g br2'>
            <div className='entire-width'>
              <span>
                {(part.get('filial_type_id') == 1) ?
                  <i className='icon_placemark-ap va-m mR5 fs10'/>
                  :
                  <i className='icon_placemark-as va-m mR5 fs10'/>
                }
                <span className='d-ib va-m'>{part.get('full_address')}</span>
              </span>
              <span>
                <i onClick={this.toggle('filial_address_'+part_index)}
                   className={cx("btn-plus-minus btn-icon",!!this.state.toggle.get('filial_address_'+part_index) && "active")}></i>
              </span>
            </div>
            <div className={cx('lh1-4', !this.state.toggle.get('filial_address_'+part_index) && "d-N")}>
              <hr className='hr m8-0'/>
              <div className='d-ib va-T mR40'>
                <div className='fw-b fs12 m10-0'>Время работы:</div>
                {part.get('operation_time').map((part, part_index) => {
                  return (
                    <div key={part_index}>
                      <span className='fw-b fs12 ta-r d-ib w35px'>{operation_time[part_index]}</span> {part.get('from')} - {part.get('to')}
                    </div>
                  )
                }).toArray()}
              </div>
              <div className='d-ib va-T'>
                <div className='fw-b fs12 m10-0'>Контактные телефоны:</div>
                {part.get('phones').map((part, part_index) => {
                  return (
                    <div key={part_index}>
                      {part}
                    </div>
                  )
                }).toArray()}
              </div>
            </div>
          </div>
        )
      })
      .toJS();
    return (
      <div>
        <div className='entire-width'>
          <div className='company-information w50pr'>
            <div className='entire-width flex-ai-c'>
              <h2 className='tt-n fs26 d-ib fw-b'>{this.state.company_information.get('name')}</h2>
              <span className='bB1d fs12'>
                Отзывы: <span className='c-red-500 cur-p'>+1</span> / <span className='c-green-500 cur-p'>-2</span>
              </span>
            </div>
            <Link className='mB25 d-ib' target='_blank' href='/'>{this.state.company_information.get('site')} </Link>
            <div className='fw-b fs12 m10-0'>Описание компании:</div>
            <div className='fs12 lh1-4 Mh140px o-h to-e ws-n'>{this.state.company_information.get('description')}</div>
            {this.state.company_information.get('brands') && [
              <div className='fw-b fs12 m10-0'>Обслуживаемые марки:</div>,
              <div className='fs12 lh1-4 h140px o-h to-e ws-n'>{this.state.company_information.get('brands')}</div>
            ]}
            <div className='filial-company'>
              <h3 className='fs20 fw-n'>Филиалы компании:</h3>
              {Filials}
            </div>
          </div>
          <div className='w50pr h500px'>
            <YandexMap
              bounds={bounds}
              height={400}
              width={500}
              header_height={0}
              baloon_template={ymap_baloon_template}
              cluster_baloon_template={ymap_cluster_baloon_template}
              on_marker_click={this.noop}
              on_marker_hover={this.noop}
              on_close_ballon_click={this.noop}
              on_balloon_event={this.noop}
              on_bounds_change={this.noop}>

                {YandexMarkers}

            </YandexMap>
          </div>

        </div>
        <hr className='hr m30-0'/>
        <div className='w700px m0-auto'>
          <h3 className='fs20 fw-n ta-c m20-0'>Отзывы</h3>
          <div className='bgc-grey-50 br5 z-depth-1 p10-20'>
            <div className='entire-width flex-ai-fe'>
              <label className='d-ib w40pr'>
                <div className='m5-0 fs14'>Ваше имя<sup>*</sup></div>

                <input
                  type='text'
                  name='name'
                  onChange={this.updateFormElement('name')}
                  className={cx({
                    'w100pr' : true,
                    'bs-error' : false
                  })}/>
              </label>
              <label className='d-ib w40pr'>
                <div className='m5-0 fs14'>Ваш E-mail<sup>*</sup></div>
                <input
                  type='text'
                  name='email'
                  onChange={this.updateFormElement('email')}
                  className={cx({
                    'w100pr' : true,
                    'bs-error' : false
                  })}/>
              </label>
              <ButtonGroup select_element_value={this.state.new_comment.get('rating')} onChange={this.updateFormElement('rating')}>
                <button name='type' className='btn-bg-group' value='+'><i className='flaticon-thumbsu fs17 c-yellow-700'/></button>
                <button name='type' className='btn-bg-group' value='-'><i className='flaticon-thumbsb fs17 c-red-500'/></button>
              </ButtonGroup>
            </div>
            <label className='d-ib w100pr mT15'>
              <div className='m5-0 fs14'>Ваш отзыв<sup>*</sup></div>
              <textarea
                type='text'
                name='comment'
                onChange={this.updateFormElement('comment')}
                className={cx({
                  'w100pr h80px' : true,
                  'bs-error' : false
                })}/>
            </label>
            <button className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m10-0 z-depth-1">Отправить</button>
          </div>
        </div>
      </div>
		);
	}
});

module.exports = AccountInfo;
