import React, {PropTypes, Component} from 'react/addons';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';

import catalogDataStore from 'stores/catalog_data_store_new.js';
import catalogActions from 'actions/catalog_data_actions_new.js';


@rafStateUpdate(() => ({
  visiblePhoneSet: catalogDataStore.getVisiblePhoneSet()
}), catalogDataStore)
export default class CatalogRowShowPhone extends Component {
  static propTypes = {
    visiblePhoneSet: PropTypes.any.isRequired,
    cellDataKey: PropTypes.any.isRequired,
    rowData: PropTypes.any.isRequired,
    rowIndex: PropTypes.any.isRequired
  }

  constructor(props) {
    super(props);
  }

  _showBalloon = () => {
    const addressId = this.props.rowData.get('addresses').get(0).get('id');

    if (catalogDataStore.getActiveAddressId() === addressId) {
      catalogActions.rowAddressActive(null, false);
    } else {
      catalogActions.rowAddressActive(this.props.rowData.get('addresses').get(0).get('id'), true);
    }
  }

  _onShowPhone = (e) => {
    catalogActions.showPhone(this.props.rowData.get('user_id'));
    e.stopPropagation();
  }

  render() {
    const showPhone = this.props.visiblePhoneSet.has(this.props.rowData.get('user_id'));
    const mainPhone = this.props.rowData.get('main_phone');

    return (
      <div className='ta-C va-M' onClick={this._showBalloon}>
        <div style={ { display: showPhone ? 'block': 'none' } }
          className="ta-C fs20">
          <span className='fs14'>{!!mainPhone && mainPhone.substr(0, 7)}</span>
        {!!mainPhone && mainPhone.substr(7)}
        </div>
        <button onClick={this._onShowPhone}
          style={ { display: showPhone ? 'none' : 'inline-block' } }
          className="p8 br2 grad-w b0 btn-shad-b ta-C">
          <i className="flaticon-phone c-deep-purple-500 fs16 mR5"></i>
          <span className=''>Показать телефон</span>
        </button>
      </div>
    );
  }
}
