import React, {Component, PropTypes} from 'react/addons';
import Link from 'components/link.jsx';
import cx from 'classnames';
import Immutable from 'immutable';

import catalogDataStore from 'stores/catalog_data_store.js';

import rafStateUpdate from 'components/hoc/raf_state_update.js';
import controllable from 'react-controllables';

@controllable(['selectedTabIndex'])
class TabBar extends React.Component {
  static defaultProps = {
    selectedTabIndex: 0
  }
  static propTypes = {
    selectedTabIndex: PropTypes.number.isRequired,
    onSelectedTabIndexChange: PropTypes.func,
  }
  constructor(props) {
    super(props);
  }
  render() {
    var selectedTabIndex = this.props.selectedTabIndex;
    return (
      <ul onClick={ this.handleClick }>
        <li className={ selectedTabIndex == 0 && 'selected' }>{ selectedTabIndex == 0 && 'selected' } Tab Zero!</li>
        <li className={ selectedTabIndex == 1 && 'selected' }>{ selectedTabIndex == 1 && 'selected' } Tab One!</li>
        <li className={ selectedTabIndex == 2 && 'selected' }>{ selectedTabIndex == 2 && 'selected' } Tab Two!</li>
      </ul>
    );
  }

  handleClick = (event) => {
    // console.log(this.props);
    // Call the `onSelectedTabIndexChange` callback with the new value.
    if (!this.props.onSelectedTabIndexChange) return;
    var el = event.target;
    var index = Array.prototype.indexOf.call(el.parentNode.children, el);
    this.props.onSelectedTabIndexChange(index);
  }

}







@rafStateUpdate(() => ({
  step: 1
}))
export default class AfterRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {step: 1};
  }
  changeStep = () => {
    this.setState((state) => ({step: ++state.step}))
  }
  handler = (e) => {
    ;
  }
  render() {
    return (
      <div>
        <Link onClick={this.changeStep}> {this.state.step}</Link>
        <TabBar />
      </div>
    );
  }
}

<table className='company-information__view-edit m10-0 w100pr'>
  <tr>
    <td>Название</td>
    <td>
      <strong>
        <EditableForms
          className={cx({'input-as-text' : !edit})}
          onChange={this.updateFormElement('name')}
          edit={edit}
          text={this.state.company_information.get('name')} />
      </strong>
    </td>
  </tr>
  <tr>
    <td>Сайт</td>
    <td>
      <EditableForms
        placeholder='Введите название вашего сайта'
        className={cx({'input-as-text' : !edit})}
        onChange={this.updateFormElement('site')}
        edit={edit}
        text={this.state.company_information.get('site')} />
    </td>
  </tr>
  <tr>
    <td>Телефон</td>
    <td>
      <EditableForms
        type='phone'
        placeholder='Контактный телефон'
        className={cx({'input-as-text' : !edit})}
        onChange={this.updateFormElement('phone')}
        edit={edit}
        text={this.state.company_information.get('phone')} />
    </td>
  </tr>
  <tr>
    <td>Комментарии об услугах</td>
    <td className='lh1-4'>
      <EditableForms
        className={cx({'input-as-text' : !edit})}
        placeholder='Описание компании'
        onChange={this.updateFormElement('description')}
        edit={edit}
        type='textarea'
        text={this.state.company_information.get('description')} />
    </td>
  </tr>
  <tr>
    <td className='ta-C h60px p0' colSpan='2'>
                                    {edit && <button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8' onClick={this.endEdit}>Сохранить</button>}
    </td>
  </tr>
</table>
<div className='filial-company'>
<h3 className='fs20 fw-n bc-g bb-s pb5'>Филиалы компании
  <i className='btn-question m0-10'/>
</h3>
{Filial}
<button className='grad-ap btn-shad b0 c-wh fs15 br3 p6-20-8 m20-0' onClick={this.extOpenModal('edit_company_filial', 'new')}>Новый филиал</button>
</div>

/*    Object.getOwnPropertyNames(this.constructor.prototype)
 .filter(x => x.startsWith('on'))
 .map(x => this[x] = this[x].bind(this));*/



function ext() {
  return (target, key, descriptor) => {
    let fn = descriptor.value;
    return {
      configurable: true,
      get() {
        let boundFn = fn.bind(this);
        Object.defineProperty(this, key, {
          value: boundFn,
          configurable: true,
          writable: true
        });
        return boundFn;
      }
    };
  };
}
function ext3(target, key, descriptor) {
  let fn = descriptor.value;
  return {
    configurable: true,
    get() {
      function boundFn() {
        fn.apply(this, arguments);
      }
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        writable: true
      });
      return boundFn;
    }
  };
}
function boundMethod(target, key, descriptor) {
  let fn = descriptor.value;
  if (typeof fn !== 'function') {
    throw new Error(`@autobind decorator can only be applied to methods not: ${typeof fn}`);
  }

  /*  if (sc.__DEV__) {
   return {
   configurable: true,
   get() {
   debugger;
   console.log(sc.__DEV__);
   var getStackTrace = function() {
   var obj = {};
   Error.captureStackTrace(obj, getStackTrace);
   return obj.stack;
   };
   let abr = getStackTrace().split('\n')[2].indexOf('makeAssimilatePrototype');
   let boundFn = fn.bind(this);
   if (abr === -1) {
   Object.defineProperty(this, key, {
   value: boundFn,
   configurable: true,
   writable: true
   });
   }
   return boundFn;
   },
   set() {
   console.log('set');
   }
   };
   }*/
  return {
    configurable: true,
    get() {
      let boundFn = fn.bind(this);
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        writable: true
      });
      return boundFn;
    }
  };


}



function ext1() {
  return function (target, key, descriptor) {
    let fn = descriptor.value;
    descriptor.value = function () {
      ;
      fn.call(this, arguments);
    };
    return descriptor;
  }
}