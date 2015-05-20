import BaseStore from 'stores/utils/base_store.js';

import eventNames from 'shared_constants/event_names.js';
import pointUtils from 'utils/point_utils.js';

import view from 'stores/utils/create_view.js';
import immutable, {fromJS} from 'immutable';

import regionStore from 'stores/region_store.js';




class SearchOrderStore extends BaseStore {

  static displayName = 'SearchOrderStore'

  state = this.initialState({
    orderFieldValidation: [],
    orderField: {}
  });

  constructor() {
    super();
    this.register(eventNames.K_ON_ORDER_VALIDATION_ERROR, this._validationError);
    this.register(eventNames.K_ON_ORDER_VALIDATION_RESET, this._resetValidation);
    this.register(eventNames.K_ON_ORDER_VALIDATION_SUCCESS, this._successValidation);
  }

  _validationError(validationInfo) {
    let errors = immutable.fromJS(validationInfo.errors);
    this.state.orderFieldValidation_cursor
      .update(orderFieldValidation => {
        return errors.map(el => el.get('property'));
      });
    this.fireChangeEvent();
  }

  _resetValidation() {
    this.state.orderFieldValidation_cursor
      .update(orderFieldValidation => orderFieldValidation.clear());
  }
  _successValidation(orderInfo) {
    this._resetValidation();
    this.state.orderField_cursor
      .update(orderField => orderField
                            .set('name', orderInfo.name)
                            .set('email', orderInfo.email)
                            .set('phone', orderInfo.phone)
      );
    console.log(this.state.orderField);
    this.fireChangeEvent();
  }

  getOrderFieldValidation() {
    return this.state.orderFieldValidation;
  }
  getOrderField() {
    return this.state.orderField;
  }
}

let searchOrderStore = new SearchOrderStore();

module.exports = searchOrderStore;
