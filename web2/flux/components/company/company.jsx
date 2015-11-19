'use strict';

var React = require('react/addons');
var _ = require('underscore');

var PureRenderMixin = React.addons.PureRenderMixin;

var Link = require('components/link.jsx');

var appElement = document.getElementById('react_main');
var Modal = require('components/modal/index');
Modal.setAppElement(appElement);

var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');



var EditableForms = require('components/editable_forms/editable_forms.jsx');

var personal_company_page_store = require('stores/personal_company_page_store.js');
var personal_company_page_actions = require('actions/personal_company_page_actions.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

import statisticsActions from 'actions/statisticsActions.js';
var region_store = require('stores/region_store.js');
var toggle_store = require('stores/ToggleStore.js');
var auth_store = require('stores/auth_store.js');
var toggle_actions = require('actions/ToggleActions.js');
var cx = require('classnames');
var immutable = require('immutable');
import CompanyMap from './catalog_map_data.jsx';
var map_data_store = require('stores/personal_company_page_data_new_store.js');
import catalogDataStore from 'stores/personal_company_page_data_new_store.js';

var ImageGallery = require('react-image-gallery');


var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({
    company_information: personal_company_page_store.get_company_information(),
    company_filials: personal_company_page_store.getCompanyFilials(),
    region_current: region_store.get_region_current(),
    regions: region_store.get_region_list(),
    toggle: toggle_store.getToggle(),
    new_comment: personal_company_page_store.get_new_comment(),
    comment_field_validation: personal_company_page_store.get_comment_field_validation(),
    comments: personal_company_page_store.get_comments(),
    rating: personal_company_page_store.get_rating(),
    user_id: auth_store.get_user_id(),
    comment_status: personal_company_page_store.get_comment_status(),

}),
	toggle_store, region_store, personal_company_page_store, auth_store, map_data_store, catalogDataStore/*observable store list*/);


var route_actions = require('actions/route_actions.js');




var personal_company_page = React.createClass({
	mixins : [
		PureRenderMixin,
		RafBatchStateUpdateMixin
	],
  toggle(val) {
    return (e) => {
console.log(21);
      statisticsActions.setStatistics('c', 'click', [this.state.company_filials.first().get('user_id')]);
      e.preventDefault();
      toggle_actions.change(val);
    }
  },
  noop() {
    // console.log('noop');
  },
  updateFormElement: function(name) {
    return (e) => {
      var value = (_.isObject(e)) ? e.target.value : e;
      personal_company_page_actions.update_form(name, value);
    };
  },
  resetAnswer(id) {
    return () => {
      this.refs['answer'+id].getDOMNode().value = '';
    };
  },
  submitAnswer(comment_id) {
    return () => {
      var comment = this.refs['answer'+comment_id].getDOMNode().value;
      !!comment &&
      personal_company_page_actions.submit_answer(comment_id,comment);
    };
  },
  commentSubmit() {
    personal_company_page_actions.submit_form(this.state.new_comment.toJS(), this.state.company_information.get('id'), 0);
  },
	render() {
    var operation_time = ['пн-пт', 'сб', 'вс'];
    var Filials = this.state.company_filials
      .map((part, part_index) => {
        return (
          <div  key={part.get('id')} className='grad-g p8 m10-0 z-depth1 br2'>
            <div onClick={this.toggle('filial_address_'+part_index)} className='entire-width cur-p'>
              <span>
                {(part.get('filial_type') == 1) ?
                  <i className='icon_placemark-ap va-M mR5 fs10'/>
                  :
                  <i className='icon_placemark-as va-M mR5 fs10'/>
                }
                <span className='va-M'>{part.get('full_address')}</span>
              </span>
              <span>
                <i
                   className={cx("btn-plus-minus btn-icon c-grey-500",!!this.state.toggle.get('filial_address_'+part_index) && "active")}></i>
              </span>
            </div>
            <div className={cx('lh1-4', !this.state.toggle.get('filial_address_'+part_index) && "d-N")}>
              <hr className='hr m8-0'/>
              <div className='d-ib va-T mR40'>
                <div className='fw-b fs12 m10-0'>Время работы:</div>
                {part.get('operation_time').map((part, part_index) => {
                  return (
                    <div key={part_index}>
                      <span className='fw-b fs12 ta-R d-ib w35px'>{operation_time[part_index]}&nbsp;</span>
                      {part.get('is_holiday') ?
                        'Выходной' :
                        `${part.get('from')} - ${part.get('to')}`
                      }
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
      .toArray();
    var comments_size = this.state.comments.size -1;
    var Comments = this.state.comments
      .reverse()
      .map((part, part_index) => {
        return ([
        <div key={part.get('id')} className='m20-0'>
          <div className='entire-width'>
            <span className='d-ib fw-b'>
              {(part.getIn(['review','rating']) === '+') ?
                <i className='flaticon-thumbsu fs17 c-green-500 mR10'/>
                :
                <i className='flaticon-thumbsb fs17 c-red-500 mR10'/>
              }{part.getIn(['review','name'])}
              {!!this.state.user_id && !part.get('answer') && this.state.user_id === part.get('company_id') &&
                <span onClick={this.toggle('answer_'+part_index)} className='cur-p fs14 mL10 fw-n c-deep-purple-500'>Ответить</span>
              }
            </span>
            <span className='c-grey-600 fs12'>{part.get('date')}</span>
          </div>
          <div className='lh1-4 m10-0'>
            {part.getIn(['review','comment'])}
          </div>
          {!!this.state.toggle.get('answer_'+part_index) && !part.get('answer') ?

            <div className='br5 z-depth1 p10-20 mB20 bgc-grey-50'>
              <div className='mL5 f-R c-grey-400 ta-C'>
                <i onClick={this.submitAnswer(part.get('id'))} className='flaticon-send fs30 cur-p'/>
                <br/>
                <i onClick={this.resetAnswer(part.get('id'))} className='flaticon-clear fs20 mT5 cur-p'/>
              </div>
              <div className='o-h'>
                 <textarea
                   ref={'answer'+part.get('id')}
                   type='text'
                   name='answer'
                   className={cx({
                     'w100pr h80px' : true
                   })}/>
              </div>
            </div>
            :
            <div className={cx('mL30 bL4s bc-grey-500 pL10', !part.get('answer') && 'd-N' )}>
              <div className='fw-b'>
                  Ответ
              </div>
              <div className='lh1-4 m10-0'>
                {part.get('answer')}
              </div>
            </div>
          }
        </div>,
        comments_size != part_index && <hr className='hr'/>
        ])
      })
      .toArray();

    const img = this.state.company_information.get('images') && this.state.company_information.get('images').size ? this.state.company_information.get('images').toJS() : [];
    const imagesSlider = img.map((el) => ({
        original: 'http://autogiper.ru/api/company_images/'+el,
        thumbnail: 'http://autogiper.ru/api/company_images/'+el
      }));



    return (
      <div>
        <div className='entire-width'>
          <div className='company-information w50pr'>
            <div className='entire-width flex-ai-c'>
              <h2 className='tt-n fs26 d-ib fw-b'>{this.state.company_information.get('name')}</h2>
              <span className='bB1d fs12'>
                Отзывы:
                <span className='c-green-500 cur-p'>+{this.state.rating.get('plus')}</span>
                /
                <span className='c-red-500 cur-p'>-{this.state.rating.get('minus')}</span>
              </span>
            </div>
              {this.state.company_information.get('site') && <Link className='mB25 d-ib' target='_blank' href={`http://www.${this.state.company_information.get('site')}`}>{this.state.company_information.get('site')} </Link>}
            <div className='fw-b fs12 m10-0'>Описание компании:</div>
            <div className='fs12 lh1-4 Mh140px o-h to-e ws-n'>{this.state.company_information.get('description')}</div>
              {this.state.company_information.get('brands') && [
                <div key={1} className='fw-b fs12 m10-0'>Обслуживаемые марки:</div>,
                <div key={2} className='fs12 lh1-4 Mh140px o-h to-e ws-n'>{this.state.company_information.get('brands')}</div>
              ]}
            <div className='filial-company'>
              <h3 className='fs20 fw-n'>Филиалы компании:</h3>
                {Filials}
            </div>
          </div>
          <div className='w50pr p-r'>
            <CompanyMap/>
            {!!imagesSlider.length && <ImageGallery
                items={imagesSlider}
                autoPlay={true}
                slideInterval={4000}/>
            }
          </div>

        </div>
        <hr className='hr m30-0'/>
        <div className='w700px m0-auto'>

          <div className={cx('br5 z-depth1 mB50 p10-20', !this.state.toggle.get('comment_show')? 'grad-as' :'bgc-grey-50')}>
            {!this.state.toggle.get('comment_show') ?
              <div className='cur-p fs18 ta-C' onClick={this.toggle('comment_show')}>
                Оставить отзыв
              </div>
            :
            [<div key={1} className='entire-width flex-ai-fe'>
              <label className='d-ib w40pr'>
                <div className='m5-0 fs14'>Ваше имя
                  <sup>*</sup>
                </div>

                <input
                  type='text'
                  name='comment_name'
                  value={this.state.new_comment.get('name')}
                  onChange={this.updateFormElement('name')}
                  className={cx({
                    'w100pr'   : true,
                    'bs-error' : !!this.state.comment_field_validation.has('name')
                  })}/>
              </label>
              <label className='d-ib w40pr'>
                <div className='m5-0 fs14'>Ваш E-mail
                  <sup>*</sup>
                </div>
                <input
                  type='text'
                  name='email'
                  value={this.state.new_comment.get('email')}
                  onChange={this.updateFormElement('email')}
                  className={cx({
                    'w100pr'   : true,
                    'bs-error' : !!this.state.comment_field_validation.has('email')
                  })}/>
              </label>
              <ButtonGroup
                select_element_value={this.state.new_comment.get('rating')}
                className={cx({'bs-error' : !!this.state.comment_field_validation.has('rating')})}
                onChange={this.updateFormElement('rating')}>
                <button name='type' className='btn-bg-group' value='+'>
                  <i className='flaticon-thumbsu fs17 c-green-500'/>
                </button>
                <button name='type' className='btn-bg-group' value='-'>
                  <i className='flaticon-thumbsb fs17 c-red-500'/>
                </button>
              </ButtonGroup>
            </div>,
            <label  key={2}  className='d-ib w100pr mT15'>
              <div className='m5-0 fs14'>Ваш отзыв
                <sup>*</sup>
              </div>

              <textarea
                type='text'
                name='comment'
                value={this.state.new_comment.get('comment') || ''}
                onChange={this.updateFormElement('comment')}
                className={cx({
                  'w100pr h80px' : true,
                  'bs-error'     : !!this.state.comment_field_validation.has('comment')
                })}/>
            </label>,
            <button  key={3}  className="grad-ap btn-shad b0 c-wh fs16 br3 p8-20 m10-0 z-depth1" onClick={this.commentSubmit}>Отправить</button>,
            <span key={4} className='mL20 fs12 va-M d-ib Mw500px'>{this.state.comment_status}</span>
            ]}
          </div>

        </div>

          {Comments}

      </div>

		);
	}
});

module.exports = personal_company_page;
