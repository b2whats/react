
import BaseStore from 'stores/utils/base_store.js';

import eventNames from 'shared_constants/event_names.js';
import pointUtils from 'utils/point_utils.js';

import view from 'stores/utils/create_view.js';
import immutable, {fromJS} from 'immutable';

import regionStore from 'stores/region_store.js';



const calcSortData = ({data, mapInfo, search}) => { // сам расчет принимает state на вход и зависит только от него
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
  const companyIds = [];
  const q = search && search.toLowerCase() || '';
  const sorted = data
    // фильтруем по поисковому фильтру
    .filter((item) => {
      let str = `${item.get('company_name')} ${item.get('description')} ${item.get('main_phone')} ${item.get('site')}`;
      return !!(str.toLowerCase().indexOf(q) + 1);
    })
    // отсортировать по видимость на карте и sort параметру
    .sortBy(item =>
      -((id2PtInRect[item.get('user_id')] || 0) * 10000000 + item.get('sort')))
    // проставить видимым айтемам то что они видимы
    .map(item =>
      id2PtInRect[item.get('user_id')] ? item.set('visible_item', true) : item.set('visible_item', false))
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


class CatalogDataStoreNew extends BaseStore {
  static displayName = 'CatalogDataStoreNew'

  state = this.initialState({
    data: [],
    // где карта
    // mapInfo: {center: [59.914938382856434, 30.29364576757814], zoom: 10, bounds: []},
    mapInfo: {center: [], zoom: 10, bounds: []},
    regionId: null,
    // над какой строкой мышка
    hoveredRowIndex: -1,
    // мышка над маркером чтобы выделить в табличке
    hoveredMapRowIndex: -1,
    // адрес балуна
    activeAddressId: null,
    // visibleRowFirst индекс первого видимого элемента,
    visibleRows: {visibleRowFirst: -1, visibleRowLast: -1},

    visiblePhonesSet: new immutable.Set(),
    search: null
  });

  constructor() {
    super();
    this.register(eventNames.K_ON_CATALOG_NEW_DATA_LOADED, this._onCatalogDataLoaded);
    this.register(eventNames.K_ON_CATALOG_NEW_MAP_BOUNDS_CHANGE, this._onBoundsChanged);
    this.register(eventNames.K_ON_CATALOG_VISIBLE_ROWS_CHANGED, this._onVisibleRowsChanged);
    this.register(eventNames.K_ON_CATALOG_ROW_HOVER, this._onRowHover);
    this.register(eventNames.K_ON_CATALOG_MAP_ROW_HOVER, this._onMapRowHover);
    this.register(eventNames.kON_REGION_CHANGED, this._onRegionChanged, regionStore.getPriority() + 1);

    this.register(eventNames.K_ON_CATALOG_ROW_ADDRESS_ACTIVE, this._onMapRowAddressActive);

    this.register(eventNames.K_ON_CATALOG_SHOW_PHONE, this._onShowPhone);
    this.register(eventNames.K_ON_CATALOG_SEARCH, this._onChangeSearch);
  }
  _onChangeSearch(text) {
    this.state.search_cursor
      .update(search => text);
    this.fireChangeEvent();
  }
  _onRegionChanged() {
    const currentRegion = regionStore.get_region_current();

    if (this.state.regionId !== currentRegion.get('id')) {
      this.state.mapInfo_cursor
        .update(mapInfo => mapInfo.merge({center: currentRegion.get('center')}));

      this.state.regionId_cursor
        .update(() => currentRegion.get('id'));

      this.fireChangeEvent();
    }
  }

  _onVisibleRowsChanged(visibleRowFirst, visibleRowLast) {
    // visibleRowFirstPart, visibleRowLastPart не обновляю ибо очень часто меняются
    this.state.visibleRows_cursor
      .update(visibleRows => visibleRows.merge({visibleRowFirst, visibleRowLast}));

    this.fireChangeEvent();
  }

  _onMapRowAddressActive(activeAddressId, activeState) {
    this.state.activeAddressId_cursor
      .update(() => activeState ? activeAddressId : null);

    this.fireChangeEvent();
  }

  _onMapRowHover(hoveredMapRowIndex, hoverState) {
    this.state.hoveredMapRowIndex_cursor
      .update(() => hoverState ? hoveredMapRowIndex : -1);

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

  _onBoundsChanged(center, zoom, bounds, marginBounds) {
    this.state.mapInfo_cursor
      .update(mapInfo => mapInfo.merge({center, bounds: marginBounds, zoom}));

    this.fireChangeEvent();
  }

  _onShowPhone(rowUserId) {
    this.state.visiblePhonesSet_cursor
      .update(prev => prev.add(rowUserId));

    this.fireChangeEvent();
  }

  getData() {
    return this.state.data;
  }
  getSearch() {
    return this.state.search;
  }

  getMapInfo() {
    return this.state.mapInfo;
  }

  getHoveredRowIndex() {
    return this.state.hoveredRowIndex;
  }

  getMapHoveredRowIndex() {
    return this.state.hoveredMapRowIndex;
  }

  getActiveAddressId() {
    return this.state.activeAddressId;
  }

  getVisibleRows() {
    return this.state.visibleRows;
  }

  getVisiblePhoneSet() {
    return this.state.visiblePhonesSet;
  }

  // view обновляется только если указанные в нем props меняюца
  @view(['data','mapInfo','search'])
  getSortedData() {
    return calcSortData(this.state);
  }

  @view(['data', 'mapInfo', 'search'])
  getFirstInvisibleRowIndex() {
    return this.getSortedData().findIndex(item => item.get('visible_item') !== true);
  }

}

let catalogDataStoreNew = new CatalogDataStoreNew();

module.exports = catalogDataStoreNew;
