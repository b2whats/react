
import BaseStore from 'stores/utils/base_store.js';

import eventNames from 'shared_constants/event_names.js';
import pointUtils from 'utils/point_utils.js';

import view from 'stores/utils/create_view.js';
import immutable, {fromJS} from 'immutable';


const calcSortData = ({data, mapInfo}) => { // сам расчет принимает state на вход и зависит только от него
  if (!data.size) {
    return immutable.fromJS([]);
  }

  if (!mapInfo.get('bounds').size) { // нет карты возвращаем просто осортированное по сорт полю
    return data.sortBy(d => -d.get('sort'));
  }

  const bounds = mapInfo.get('bounds');

  // создать словарик user_id => есть ли хоть один адрес на карте
  const id2PtInRect = data
    .filter(item =>
      item.get('addresses')
        .some(addr =>
          pointUtils.imPtInImRect(addr.get('coordinates'), bounds)))
    .reduce((r, item) => {
      r[item.get('user_id')] = 1;
      return r;
    }, {});

  const sorted = data
    // отсортировать по видимость на карте и sort параметру
    .sortBy(item =>
      -((id2PtInRect[item.get('user_id')] || 0) * 10000000 + item.get('sort')))
    // проставить видимым айтемам то что они видимы
    .map(item =>
      id2PtInRect[item.get('user_id')] ? item.set('visible_map', true) : item)
    // у видимых айтемов адреса отсортировать по видимости, у невидимых оставить как есть
    .map(item =>
      item.get('visible_map') === true ?
        item.set('addresses',
          item.get('addresses')
            .sortBy(addr =>
              pointUtils.imPtInImRect(addr.get('coordinates'), bounds) ? 1 : 0))
        : item );

  return sorted;
};

const calcVisibleMarkers = (sortData, {mapInfo}) => {


};

class CatalogDataStoreNew extends BaseStore {
  state = this.initialState({
    data: [],
    mapInfo: {center: [59.744465, 30.042834], zoom: 8, bounds: []},
    visibleElements: {startRow: 0, endRow: 0} // пришел к мысли менять только на скроле надо добавлять удалять иконки иначе стремная картинка
  });

  constructor() {
    super();
    this.register(eventNames.K_ON_CATALOG_NEW_DATA_LOADED, this._onCatalogDataLoaded);
    this.register(eventNames.K_ON_CATALOG_NEW_MAP_BOUNDS_CHANGE, this._onBoundsChanged);
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

  getMapInfo() {
    return this.state.mapInfo;
  }

  // view обновляется только если указанные в нем props меняюца
  @view(['data', 'mapInfo'])
  getSortedData() {
    const res = calcSortData(this.state);
    // console.log('view result', res); // eslint-disable-line no-console
    return res;
  }

  @view(['data', 'mapInfo'])
  getVisibleMarkers() {
    return calcVisibleMarkers(this.getSortedData(), this.state);
  }

}

let catalogDataStoreNew = new CatalogDataStoreNew();

module.exports = catalogDataStoreNew;
