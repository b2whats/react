
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
      id2PtInRect[item.get('user_id')] ? item.set('visible_item', true) : item)
    // у видимых айтемов адреса отсортировать по видимости, у невидимых оставить как есть
    .map(item =>
      item.get('visible_item') === true ?
        item.set('addresses',
          item.get('addresses')
            .map(addr => addr.set('visible_address', pointUtils.imPtInImRect(addr.get('coordinates'), bounds)))
            .sortBy(addr => addr.get('visible_address') ? 0 : 1))
        : item );

  return sorted;
};

const calcVisibleMarkers = (sortData, {mapInfo}) => {


};

class CatalogDataStoreNew extends BaseStore {
  state = this.initialState({
    data: [],
    // где карта
    mapInfo: {center: [59.744465, 30.042834], zoom: 8, bounds: []},
    // над какой строкой мышка
    hoveredRowIndex: -1,
    // visibleRowFirst индекс первого видимого элемента, visibleRowFirstPart какая часть элемента видна (например 0.5) только половина видна
    visibleRows: {visibleRowFirst: -1, visibleRowLast: -1, visibleRowFirstPart: 1, visibleRowLastPart: 1}
  });

  constructor() {
    super();
    this.register(eventNames.K_ON_CATALOG_NEW_DATA_LOADED, this._onCatalogDataLoaded);
    this.register(eventNames.K_ON_CATALOG_NEW_MAP_BOUNDS_CHANGE, this._onBoundsChanged);
    this.register(eventNames.K_ON_CATALOG_VISIBLE_ROWS_CHANGED, this._onVisibleRowsChanged);
    this.register(eventNames.K_ON_CATALOG_ROW_HOVER, this._onRowHover);
  }

  _onVisibleRowsChanged(visibleRowFirst, visibleRowLast, visibleRowFirstPart, visibleRowLastPart) {
    this.state.visibleRows_cursor
      .update(visibleRows => visibleRows.merge({visibleRowFirst, visibleRowLast}));

    this.fireChangeEvent();
  }

  _onRowHover(hoveredRowIndex, hoverState) {
    this.state.hoveredRowIndex_cursor
      .update(() => hoverState ? hoveredRowIndex : -1);

    this.fireChangeEvent();
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

  getHoveredRowIndex() {
    return this.state.hoveredRowIndex;
  }

  getVisibleRows() {
    return this.state.visibleRows;
  }

  // view обновляется только если указанные в нем props меняюца
  @view(['data', 'mapInfo'])
  getSortedData() {
    return calcSortData(this.state);
  }

  @view(['data', 'mapInfo'])
  getVisibleMarkers() {
    return calcVisibleMarkers(this.getSortedData(), this.state);
  }

}

let catalogDataStoreNew = new CatalogDataStoreNew();

module.exports = catalogDataStoreNew;
