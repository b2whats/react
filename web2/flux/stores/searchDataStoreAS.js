
import BaseStore from 'stores/utils/base_store.js';

import eventNames from 'shared_constants/event_names.js';
import pointUtils from 'utils/point_utils.js';

import view from 'stores/utils/create_view.js';
import immutable, {fromJS} from 'immutable';

import regionStore from 'stores/region_store.js';


const calcSortData = ({data, mapInfo}) => { // сам расчет принимает state на вход и зависит только от него
  if (!data.size) {
    return immutable.fromJS([]);
  }

  if (!mapInfo.get('bounds').size) { // нет карты возвращаем просто осортированное по сорт полю
    return data.sortBy(d => -d.get('sort'));
  }

  const bounds = mapInfo.get('bounds');
  const center = mapInfo.get('center');

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
  // console.log(id2PtInRect);
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
            .map(addr => {
              return addr.set('visible_address', pointUtils.imPtInImRect(addr.get('coordinates'), bounds))
                         .set('distance_to_center', pointUtils.distanceToCenter(addr.get('coordinates').toJS(), center.toJS()));
            })
            .sortBy(addr => addr.get('visible_address') ? 0 : 1)
            .sortBy(addr => addr.get('distance_to_center')))
        : item );
  // console.log(sorted.toJS());
  return sorted;
};


class SearchDataStoreAS extends BaseStore {
  static displayName = 'SearchDataStoreAS'

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
    // visibleRowFirst индекс первого видимого элемента,
    visibleRows: {visibleRowFirst: 0, visibleRowLast: 15},
    showAllPhone: {autoparts: false, autoservices: false},
    visiblePhone: []
  });

  constructor() {
    super();
    this.register(eventNames.K_ON_SEARCH_AS_DATA_LOADED, this._onAutoPartsDataLoaded);
    this.register(eventNames.K_ON_SEARCH_MAP_BOUNDS_CHANGE_AS, this._onBoundsChanged);
    this.register(eventNames.K_ON_SEARCH_VISIBLE_ROWS_CHANGED_AS, this._onVisibleRowsChanged);
    this.register(eventNames.K_ON_SEARCH_ROW_HOVER_AS, this._onRowHover);
    this.register(eventNames.K_ON_SEARCH_MAP_ROW_HOVER_AS, this._onMapRowHover);
    this.register(eventNames.kON_REGION_CHANGED, this._onRegionChanged, regionStore.getPriority() + 1);

    this.register(eventNames.K_ON_SEARCH_SHOW_ALL_PHONE_CHANGE_AS, this._onShowAllPhoneChanged);
    this.register(eventNames.K_ON_SEARCH_SHOW_PHONE_CHANGE_AS, this._onVisiblePhoneChanged);
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

  _onAutoPartsDataLoaded(v) {
    this.state.data_cursor
      .update(() => fromJS(v));
    this.state.visiblePhone_cursor
      .update(visiblePhone => visiblePhone.clear());
    this.fireChangeEvent();
  }

  _onBoundsChanged(center, zoom, bounds, marginBounds) {
    this.state.mapInfo_cursor
      .update(mapInfo => mapInfo.merge({center, bounds: marginBounds, zoom}));


    this.fireChangeEvent();
  }
  _onShowAllPhoneChanged(type) {
    this.state.showAllPhone_cursor
      .update(showAllPhone => showAllPhone.set(type, !showAllPhone.get(type)));

    this.fireChangeEvent();
  }

  _onVisiblePhoneChanged(userId) {
    this.state.visiblePhone_cursor
      .update(visiblePhone => visiblePhone.push(userId));

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

  getMapHoveredRowIndex() {
    return this.state.hoveredMapRowIndex;
  }

  getVisibleRows() {
    return this.state.visibleRows;
  }

  getShowAllPhone() {
    return this.state.showAllPhone;
  }

  getVisiblePhone() {
    return this.state.visiblePhone;
  }
  // view обновляется только если указанные в нем props меняюца
  @view(['data', 'mapInfo'])
  getSortedData() {
    return calcSortData(this.state);
  }
  @view(['data', 'mapInfo'])
  getFirstInvisibleRowIndex() {
    return this.getSortedData().findIndex(item => item.get('visible_item') !== true);
  }
}

let searchDataStoreAS = new SearchDataStoreAS();

module.exports = searchDataStoreAS;
