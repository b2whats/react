/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
// import controllable from 'react-controllables';
import immutable from 'immutable';
import sc from 'shared_constants';

import GoogleMap from 'components/google/google_map.js';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';
import searchOrderActions from 'actions/searchOrderActions.js';
import MapMarker, {K_SCALE_NORMAL, K_MARKER_WIDTH, K_MARKER_HEIGHT} from 'components/markers/map_marker.jsx';
import raf from 'utils/raf.js';
import statisticsActions from 'actions/statisticsActions.js';
import invariant from 'fixed-data-table-ice/internal/invariant.js';

// import catalogDataStore from 'stores/catalog_data_store_new.js';
// import catalogActions from 'actions/catalog_data_actions_new.js';

import {getScale, getRealFromTo} from 'components/catalog_page_new/calc_markers_visibility.js';


const K_MAP_OPTIONS = null; // options to create map
const K_HOVER_DISTANCE = 30;

// @controllable(['markers'])
/*
@rafStateUpdate(() => ({
  zoom: catalogDataStore.getMapInfo().get('zoom'),
  center: catalogDataStore.getMapInfo().get('center'),
  visibleRows: catalogDataStore.getVisibleRows(),
  dataResults: catalogDataStore.getSortedData(),
  hoveredRowIndex: catalogDataStore.getHoveredRowIndex(),
  onRowMapHover: catalogActions.rowMapHover,
  oMapBoundsChange: catalogActions.mapBoundsChange
}), catalogDataStore)
*/
export default class CatalogMap extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any.isRequired,
    zoom: PropTypes.number.isRequired,
    visibleRowsAP: PropTypes.any.isRequired,
    dataResultsAP: PropTypes.any.isRequired,
    hoveredRowIdAP: PropTypes.number,
    visibleRowsAS: PropTypes.any.isRequired,
    dataResultsAS: PropTypes.any.isRequired,
    hoveredRowIdAS: PropTypes.number,
    mapMargin: PropTypes.array,
    activeAddressId: PropTypes.any,
    onRowAddressActive: PropTypes.func,
    onRowMapHover: PropTypes.func,
    oMapBoundsChange: PropTypes.func
  }

  static defaultProps = {
    mapMargin: [30, 30, 30, 30]
  };

  constructor(props) {
    super(props);
  }

  _distanceToMouse(pt, mousePos, markerProps) {
    // const K_MARKER_HEIGHT = 62;
    // маркер жирный вверху туда с большей вероятностью будут тянуть мышку
    const K_MARKER_WEIGHT_PT = K_MARKER_HEIGHT * 0.7;
    // см в render ниже как задаем scale
    const scale = markerProps.scale;
    // расстояние считаем не от пипочки маркера а от толстой части маркера - на нее мышку ведут а не на пипочку
    // координаты пипочки pt.x, pt.y
    const x = pt.x;
    const y = pt.y - K_MARKER_WEIGHT_PT * scale;
    // так как scale самого большого маркера (без хувера) K_SCALE_NORMAL то нормализуем scale в отрезок [0,1]
    // у обычного маркера он равен 1 у тех что меньше меньше
    const scaleNormalized = Math.min(scale / K_SCALE_NORMAL, 1);
    // чем больше скейл тем надо вероятнее чтобы юзер навел на маркер, это можно сделать уменьшив дистанцию
    // совсем уменьшать тоже нельзя так что возьмем коэффициент 0.6
    // если поставить этот коэффициент в 0.1 то на мелкие маркеры вообще можно ненавестись
    const K_MIN_DIST_MIN_KOEF = 0.6;
    // для обычного маркера вес будет равен K_MIN_DIST_MIN_KOEF для остальных больше
    const distKoef = 1 + scaleNormalized * (K_MIN_DIST_MIN_KOEF - 1);
    return distKoef * Math.sqrt((x - mousePos.x) * (x - mousePos.x) + (y - mousePos.y) * (y - mousePos.y));
  }


  _onBoundsChange = (center, zoom, bounds, marginBounds) => {
    if (this.props.oMapBoundsChange) {
      this.props.oMapBoundsChange(center, zoom, bounds, marginBounds);
    }

    if (this.props.onRowAddressActive) {
      this.props.onRowAddressActive(null, false);
    }
  }

  _onChildClick = (key, props) => {

    if (this.props.onRowAddressActive) {
      const userId = props.marker.get('user_id');
      const subscribeDetails = this.props.dataResultsAP
        .filter(x => x.get('isCopy'))
        .filter(x => x.get('user_id') === userId);
      if (props.marker.get('id') === this.props.activeAddressId) {
        this.props.onRowAddressActive(null, false);
      } else {
        this.props.onRowAddressActive(props.marker.get('id'), true);
      }
      let type = props.markerType === 'autoservices' ? 'as' : 'ap';
      statisticsActions.setStatistics(type, 'click', [userId]);
      if (subscribeDetails.size > 0) {
        let part = subscribeDetails.get(0).toJS();
        let order = {
          sender: {},
          subject: part,
          companyRecipientId: part.user_id,
          servicesId: 4
        };
        searchOrderActions.submit(order);
      }
    }
  }

  _onChildCloseClick = () => {
    if (this.props.onRowAddressActive) {
      this.props.onRowAddressActive(null, false);
    }
  }

  _onChildMouseEnter = (key, props) => {
    const rowIndex = props.marker.get('user_id');
    if (rowIndex > -1) {
      if (this.props.onRowMapHover) {
        this.props.onRowMapHover(rowIndex, props.markerType, true);
      }
    }
  }

  _onChildMouseLeave = (key, props) => {
    const rowIndex = props.marker.get('user_id');
    if (rowIndex > -1) {
      if (this.props.onRowMapHover) {
        this.props.onRowMapHover(rowIndex, props.markerType, false);
      }
    }
  }

  render() {
    // console.log('this.props.activeAddressId', this.props.activeAddressId);
    const visibleRowFromAP = this.props.visibleRowsAP.get('visibleRowFirst');
    const visibleRowToAP = this.props.visibleRowsAP.get('visibleRowLast');

    const {rowFrom: rowFromAP, rowTo: rowToAP} = getRealFromTo(visibleRowFromAP, visibleRowToAP, this.props.dataResultsAP.size);
    const emptyIm = new immutable.List();

    const MarkersAP = rowFromAP === -1 ? emptyIm : (new immutable.Range(rowFromAP, rowToAP + 1)).toList()
      .flatMap( rowIndex => {
        const row = this.props.dataResultsAP.get(rowIndex);

        if (row.get('visible_item')) {
          return row.get('addresses')
            .filter(addr => addr.get('visible_address'))
            .map((addr,index) => (
              <MapMarker
                // required params
                key={addr.get('id') + '' + rowIndex}
                lat={addr.get('coordinates').get(0)}
                lng={addr.get('coordinates').get(1)}
                // any params
                markerType={'autoparts'}
                onCloseClick={this._onChildCloseClick}
                showBallon={this.props.activeAddressId === addr.get('id')}
                hoveredAtTable={this.props.hoveredRowIdAP === addr.get('user_id')}
                scale={getScale(rowIndex, visibleRowFromAP, visibleRowToAP)}
                marker={addr}
                />
            ));
        }
        return emptyIm;
      });
    const visibleRowFromAS = this.props.visibleRowsAS.get('visibleRowFirst');
    const visibleRowToAS = this.props.visibleRowsAS.get('visibleRowLast');
    const {rowFrom: rowFromAS, rowTo: rowToAS} = getRealFromTo(visibleRowFromAS, visibleRowToAS, this.props.dataResultsAS.size);
    const MarkersAS = rowFromAS === -1 ? emptyIm : (new immutable.Range(rowFromAS, rowToAS + 1)).toList()
      .flatMap( rowIndex => {
        const row = this.props.dataResultsAS.get(rowIndex);
        if (row.get('visible_item')) {
          return row.get('addresses')
            .filter(addr => addr.get('visible_address'))
            .map((addr, index) => (
              <MapMarker
                // required params
                key={addr.get('id') + '' + rowIndex}
                lat={addr.get('coordinates').get(0)}
                lng={addr.get('coordinates').get(1)}
                // any params
                markerType={'autoservices'}
                onCloseClick={this._onChildCloseClick}
                showBallon={this.props.activeAddressId === addr.get('id')}
                hoveredAtTable={this.props.hoveredRowIdAS === addr.get('user_id')}
                scale={getScale(rowIndex, visibleRowFromAS, visibleRowToAS)}
                marker={addr}
              />
            ));
        }
        return emptyIm;
      });
    return (
      <GoogleMap
        apiKey={sc.kGOOGLE_MAP_API_KEY}
        className={this.props.className}
        hoverDistance={K_HOVER_DISTANCE}
        distanceToMouse={this._distanceToMouse}
        center={this.props.center.toJS()}
        onBoundsChange={this._onBoundsChange}
        onChildMouseEnter={this._onChildMouseEnter}
        onChildMouseLeave={this._onChildMouseLeave}
        onChildClick={this._onChildClick}
        margin={this.props.mapMargin}
        debounced={true} // слать запросы onBoundsChange только на idle
        zoom={this.props.zoom}
        options={K_MAP_OPTIONS}>
        {[MarkersAP,MarkersAS]}
      </GoogleMap>
    );
  }
}
