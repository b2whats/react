'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var route_names = require('shared_constants/route_names.js');
/* jshint ignore:start */
var Link = require('components/link.jsx');
var RegionSelector = require('./region_selector.jsx');
/* jshint ignore:end */
var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');
var rafBatchStateUpdateMixinCreate = require('../mixins/raf_state_update.js');
Modal.setAppElement(appElement);
var cx = require('classnames');

var kDEFAULT_REGION_ID = 'moskva';

var ModalMixin = require('../mixins/modal_mixin.js');
var ButtonGroup = require('components/forms_element/button_group.jsx');
var Register = require('./register.jsx');
var SignIn = require('./signin.jsx');
var form_actions = require('actions/form_actions.js');
var auth_store = require('stores/auth_store.js');
var region_store = require('stores/region_store.js');
var route_actions = require('actions/route_actions.js');
var modal_store = require('stores/modal_store.js');
var auth_actions = require('actions/auth_actions.js');
var toggle_actions = require('actions/toggle_actions.js');
var toggle_store = require('stores/toggle_store.js');
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    modalIsOpen : modal_store.get_modal_visible(),
    is_auth     : auth_store.is_auth(),
    email       : auth_store.get_email(),
    toggle      : toggle_store.get_toggle(),
  }),
  modal_store, auth_store, toggle_store /*observable store list*/);
var Header = React.createClass({
  mixins       : [
    PureRenderMixin,
    RafBatchStateUpdateMixin,
    ModalMixin
  ],
  extOpenModal : function (id_modal) {
    return () => {
      form_actions.reset_form_validate();
      this.openModal(id_modal)();
    }
  },
  extToggle(val) {
    return () => {
      toggle_actions.change(val);
      //Тут таймер нужен для установки фокуса на список. В данный момент его еще нет в ДОМе
      //поэтому еще нечего устанавливать
      setTimeout(() => {
        if (!!this.state.toggle.get('drop_down_menu')) {
          this.refs.menu.getDOMNode().focus();
        }
      }, 200);
    }
  },
  closeMenu(e) {
    var current = e.currentTarget;
    var target = e.target;
    setTimeout(() => {
      if (current === target) {
        //Не успевает произойти onClick как элемент исчезает, поэтому
        //нужен таймер который будет учитывать все действия
        setTimeout(() => {
          toggle_actions.change('drop_down_menu');
        }, 200);
      }
    }, 0);

  },
  logOut() {
    auth_actions.log_out();
  },
  render() {
console.log('render' + this.state.toggle.get('drop_down_menu'));
    return (
      <div className="hfm-wrapper main-header header entire-width">

        <RegionSelector />

        <div className="top-navbar">
          <Link
            className="h_link m0-10"
            href={route_names.kROUTE_CATALOG}
            params={ {
              region_id : kDEFAULT_REGION_ID,
              type      : '_',
              brands    : '_',
              services  : '_'
            } }>Каталог компаний</Link>

          <Link className="no-href m0-10">|</Link>
					{(!this.state.is_auth) ?
            <span>
              <Link className="ap-link m0-10" onClick={this.extOpenModal('register')}>Регистрация</Link>
              <Link className = "ap-link m0-10" onClick={this.extOpenModal('signin')}>Вход</Link>
            </span>
            :
            <div className='d-ib p-r drop-down  m0-10'>
              <span onClick={this.extToggle('drop_down_menu')} className="ap-link us-n">{this.state.email}</span>
              <ul ref='menu' tabIndex='1' onBlur={this.closeMenu}  className={cx("drop-down-list lst-n w210px", {"d-n": !!!this.state.toggle.get('drop_down_menu')})} >
                <li>
                  <Link className = "h_link" href='/account/:region_id/company' params={{region_id : kDEFAULT_REGION_ID}}>Мой аккаунт</Link>
                </li>
                <li>
                  <Link className = "h_link" href='/account/:region_id/services' params={{region_id : kDEFAULT_REGION_ID}}>Услуги</Link>
                </li>
                <li>
                  <Link className = "h_link" href='/account/:region_id/manage' params={{region_id : kDEFAULT_REGION_ID}}>Управление товарами</Link>
                </li>
                <li>
                  <Link  className = "h_link" href='/account/:region_id/statistics' params={{region_id : kDEFAULT_REGION_ID}}>Статистика</Link>
                </li>
                <li>
                  <Link className = "h_link" href='/account/:region_id/history' params={{region_id : kDEFAULT_REGION_ID}}>История оплат</Link>
                </li>
                <li>
                  <Link className = "cur-p h_link" onClick={this.logOut}>Выход</Link>
                </li>
              </ul>
            </div>
            }

          <SignIn />
          <Modal
            isOpen={!!this.state.modalIsOpen.get('register')}
            onRequestClose={this.handleModalCloseRequest}>
            <Register />
          </Modal>
        </div>
      </div>
    );
  }
});

module.exports = Header;
