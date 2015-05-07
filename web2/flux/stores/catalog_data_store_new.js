
import BaseStore from 'stores/utils/base_store.js';

import eventNames from 'shared_constants/event_names.js';
const pointUtils = require('utils/point_utils.js');

import view from 'stores/utils/create_view.js';
import immutable, {fromJS} from 'immutable';


const calcSortData = ({data, mapInfo}) => { // сам расчет принимает state на вход и зависит только от него
  if (data.size) {
    console.log('VIEW UPDATED', data.get(0).get('addresses').get(0).get('coordinates').toString()); // eslint-disable-line no-console
    return 'jopa';
  }
  return null;
};


class CatalogDataStoreNew extends BaseStore {
  state = this.initialState({
    data: [],
    mapInfo: {center: [], zoom: 0, bounds: []}
  });

  constructor() {
    super();
    this.register(eventNames.K_CATALOG_NEW_DATA_LOADED, this._onCatalogDataLoaded);
    this.register(eventNames.K_CATALOG_NEW_MAP_BOUNDS_CHANGE, this._onBoundsChanged);
  }

  _onCatalogDataLoaded(v) {
    this.state.data_cursor
      .update(() => fromJS(v));

    this.fireChangeEvent();
  }

  _onBoundsChanged(center, bounds, zoom) {
    this.state.mapInfo_cursor
      .update(mapInfo => mapInfo.merge({center, bounds, zoom}));

    this.fireChangeEvent();
  }

  getData() {
    return this.state.data;
  }

  // view обновляется только если указанные в нем props меняюца
  @view(['data', 'mapInfo'])
  getSortedData() {
    const res = calcSortData(this.state);
    console.log('view result', res); // eslint-disable-line no-console
    return res;
  }
}

let catalogDataStoreNew = new CatalogDataStoreNew();

module.exports = catalogDataStoreNew;
