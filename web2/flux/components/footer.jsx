'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */
var cx = require('classnames');
var toggle_actions = require('actions/ToggleActions.js');
var toggle_store = require('stores/ToggleStore.js');
var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({ //state update lambda
    toggle      : toggle_store.getToggle(),
  }),
  toggle_store /*observable store list*/);

var Footer = React.createClass({
  mixins: [PureRenderMixin,RafBatchStateUpdateMixin],
  closeMenu() {
    toggle_actions.change('drop_up_menu');
  },
  extToggle(val) {
    return () => {
      toggle_actions.change(val);
      setTimeout(() => {
        if (!!this.state.toggle.get('drop_up_menu')) {
          this.refs.menu.getDOMNode().focus()
        }
      }, 200);
    }
  },
  render () {
    return (
      <div className="footer main-footer">
        <div className="hfm-wrapper entire-width">
          <span>
            <span className="copyright m0-10">© 2013-{new Date().getFullYear()} AutoGiper.ru</span>
            <Link className="h_link m0-10" href="/">Информационная поддержка</Link>
            <Link className="h_link m0-10" href={'/agreement'}>Пользовательское соглашение</Link>
            <div className='d-ib p-r drop-up  m0-10'>
              <span onClick={this.extToggle('drop_up_menu')} className="ap-link us-n">Контакты</span>
              <ul ref='menu' tabIndex='1' onBlur={this.closeMenu}  className={cx("drop-up-list lst-N", {"d-N": !!!this.state.toggle.get('drop_up_menu')})} >
                <li>
                  Москва(тех.поддержка для продавцов) <strong>+7(499)322-21-74</strong>
                </li>
                <li>
                  Санкт-Петербург(тех.поддержка для продавцов)  <strong>+7(812)407-26-09</strong>
                </li>
                <li>
                  Почта поддержки  <strong>manager1@autogiper.ru</strong>
                </li>
              </ul>
            </div>
            <Link className="h_link m0-10" href={'/static/partners.html'}>Рекламодателям</Link>
            <Link className="h_link m0-10" href={'http://www.mims.ru/ru-RU/visitors/ticket.aspx#personal'}>Мы - участники MIMS 2015</Link>
          </span>
          {/*<span>
            Мы в соц. сетях :
            <Link target="_blank" className="c-deep-purple-500 H-c-yellow-500" href="https://www.facebook.com/groups/autogiper/"><i className="icon-facebook-rect"></i></Link>
            <Link className="c-deep-purple-500 H-c-yellow-500" href="http://vk.com/theautogiper"><i className="icon-vkontakte-rect"></i></Link>
          </span>*/}
        </div>
      </div>
    );
  }
});

module.exports = Footer;
