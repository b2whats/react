'use strict';

var _ = require('underscore');
var main_dispatcher = require('dispatchers/main_dispatcher.js').create_proxy();

var event_names = require('shared_constants/event_names.js');
var sc = require('shared_constants');
//var route_names = require('shared_constants/route_names.js');
var point_utils = require('utils/point_utils.js');

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var init_state = require('utils/init_state.js');

var immutable = require('immutable');

import regionStore from 'stores/region_store.js';
import pointUtils from 'utils/point_utils.js';


const calcSortData = (data, mapInfo) => { // сам расчет принимает state на вход и зависит только от него
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
                         .set('address', addr.get('full_address'))
                         .set('company_name', item.get('name'))
                         .set('filial_phones', addr.get('phones'));
            })
            .sortBy(addr => addr.get('visible_address') ? 0 : 1))
        : item );
  // console.log(sorted.toJS());
  return sorted;
};


var kON_CATALOG__CATALOG_STORE_PRIORITY =  sc.kON_CATALOG__CATALOG_STORE_PRIORITY; //меньше дефолтной

var state_ =  init_state(_.last(__filename.split('/')), {
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
  visibleRows: {visibleRowFirst: 0, visibleRowLast: 15},
});





var cncl_ = [

main_dispatcher
  .on(event_names.kON_REGION_CHANGED, () => {
    const currentRegion = regionStore.get_region_current();

    if (state_.regionId !== currentRegion.get('id')) {
      state_.mapInfo_cursor
        .update(mapInfo => mapInfo.merge({center: currentRegion.get('center')}));
console.log('reg', state_.mapInfo.toJS());
      state_.regionId_cursor
        .update(() => currentRegion.get('id'));

      personal_company_page_data_store1.fire(event_names.kON_CHANGE);
    }


    personal_company_page_data_store1.fire(event_names.kON_CHANGE);
  }, kON_CATALOG__CATALOG_STORE_PRIORITY),
  main_dispatcher
  .on(event_names.kPERSONAL_PAGE_MAP_LOADED, (catalog_data) => {
      state_.data_cursor
        .update(() => immutable.fromJS(catalog_data));


    personal_company_page_data_store1.fire(event_names.kON_CHANGE);
  }, kON_CATALOG__CATALOG_STORE_PRIORITY),

  main_dispatcher
    .on(event_names.K_ON_COMPANY_MAP_NEW_MAP_BOUNDS_CHANGE, (center, zoom, bounds, marginBounds) => {
      state_.mapInfo_cursor
        .update(mapInfo => mapInfo.merge({center, bounds: marginBounds, zoom}));
      personal_company_page_data_store1.fire(event_names.kON_CHANGE);
    }, kON_CATALOG__CATALOG_STORE_PRIORITY),

  main_dispatcher
    .on(event_names.K_ON_COMPANY_MAP_VISIBLE_ROWS_CHANGED, (visibleRowFirst, visibleRowLast) => {
      state_.visibleRows_cursor
        .update(visibleRows => visibleRows.merge({visibleRowFirst, visibleRowLast}));
    }, kON_CATALOG__CATALOG_STORE_PRIORITY),

  main_dispatcher
    .on(event_names.K_ON_COMPANY_MAP_ROW_HOVER, (hoveredRowIndex, hoverState) => {
      console.log(hoveredRowIndex, hoverState);
      state_.hoveredRowIndex_cursor
        .update(() => hoverState ? hoveredRowIndex : -1);
    }, kON_CATALOG__CATALOG_STORE_PRIORITY),

  main_dispatcher
    .on(event_names.K_ON_COMPANY_MAP_MAP_ROW_HOVER, (hoveredMapRowIndex, hoverState) => {
      state_.hoveredMapRowIndex_cursor
        .update(() => hoverState ? hoveredMapRowIndex : -1);
    }, kON_CATALOG__CATALOG_STORE_PRIORITY),


  main_dispatcher
    .on(event_names.K_ON_COMPANY_MAP_ROW_ADDRESS_ACTIVE, (activeAddressId, activeState) => {
      state_.activeAddressId_cursor
        .update(() => activeState ? activeAddressId : null);
      personal_company_page_data_store1.fire(event_names.kON_CHANGE);
    }, kON_CATALOG__CATALOG_STORE_PRIORITY),
  //---------------------------------------------------------------------




];

var personal_company_page_data_store1 = merge(Emitter.prototype, {
  getSortedData() {
    return calcSortData(state_.data, state_.mapInfo);
  },
  getData() {
    return state_.data;
  },

  getMapInfo() {
    return state_.mapInfo;
  },

  getHoveredRowIndex() {
    return state_.hoveredRowIndex;
  },
  getVisibleRows() {
    return state_.visibleRows;
  },
  getMapHoveredRowIndex() {
    return state_.hoveredMapRowIndex;
  },
  getActiveAddressId() {
    return state_.activeAddressId;
  },
  dispose () {
    if(cncl_) {
      _.each(cncl_, cncl => cncl());
    }
    cncl_ = null;
  },
  $assert_info: main_dispatcher.get_assert_info()
});


module.exports = personal_company_page_data_store1;

