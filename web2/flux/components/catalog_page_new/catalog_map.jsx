/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';
import immutable from 'immutable';

import GoogleMap from 'components/google/google_map.js';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';

import MapMarker, {K_SCALE_NORMAL} from 'components/markers/map_marker.jsx';
import raf from 'utils/raf.js';

import invariant from 'fixed-data-table-ice/internal/invariant.js';

import catalogDataStore from 'stores/catalog_data_store_new.js';
import catalogActions from 'actions/catalog_data_actions_new.js';

import {getScale, getRealFromTo} from './calc_markers_visibility.js';

const K_MAP_OPTIONS = null; // options to create map
const K_HOVER_DISTANCE = 30;

// @controllable(['markers'])
@rafStateUpdate(() => ({
  zoom: catalogDataStore.getMapInfo().get('zoom'),
  center: catalogDataStore.getMapInfo().get('center'),
  visibleRows: catalogDataStore.getVisibleRows(),
  catalogResults: catalogDataStore.getSortedData(),
  hoveredRowIndex: catalogDataStore.getHoveredRowIndex()
}), catalogDataStore)
export default class CatalogMap extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any,
    zoom: PropTypes.number,
    visibleRows: PropTypes.any,
    catalogResults: PropTypes.any,
    hoveredRowIndex: PropTypes.number
  }

  static defaultProps = {

  };

  constructor(props) {
    super(props);
  }

  _onCenterChange = (center, bounds, zoom) => {
    catalogActions.mapBoundsChange(center, bounds, zoom);
  }

  _distanceToMouse(pt, mousePos, markerProps) {
    const K_MARKER_HEIGHT = 62;
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

  onChildMouseEnter_(key, props) {
    // console.log('onChildMouseEnter_ parentIndex', key, props.rowIndex);
    catalogActions.rowMapHover(props.rowIndex, true);
  }

  onChildMouseLeave_(key, props) {
    // console.log('onChildMouseLeave', key, props.rowIndex);
    catalogActions.rowMapHover(props.rowIndex, false);
  }

  render() {
    if (this.props.center.size === 0) {
      return null;
    }

    const visibleRowFrom = this.props.visibleRows.get('visibleRowFirst');
    const visibleRowTo = this.props.visibleRows.get('visibleRowLast');
    const {rowFrom, rowTo} = getRealFromTo(visibleRowFrom, visibleRowTo, this.props.catalogResults.size);
    const emptyIm = new immutable.List();

    const Markers = rowFrom === -1 ? emptyIm : (new immutable.Range(rowFrom, rowTo + 1)).toList()
      .flatMap( rowIndex => {
        const row = this.props.catalogResults.get(rowIndex);

        if (row.get('visible_item')) {
          return row.get('addresses')
            .filter(addr => addr.get('visible_address'))
            .map(addr => (
              <MapMarker
                // required params
                key={addr.get('id')}
                lat={addr.get('coordinates').get(0)}
                lng={addr.get('coordinates').get(1)}
                // any params
                rowIndex={rowIndex}
                hoveredAtTable={this.props.hoveredRowIndex === rowIndex}
                scale={getScale(rowIndex, visibleRowFrom, visibleRowTo)}
                marker={addr} />
            ));
        }
        return emptyIm;
      });

    return (
      <GoogleMap
        className={this.props.className}
        hoverDistance={K_HOVER_DISTANCE}
        distanceToMouse={this._distanceToMouse}
        center={this.props.center.toJS()}
        onCenterChange={this._onCenterChange}
        onChildMouseEnter={this.onChildMouseEnter_}
        onChildMouseLeave={this.onChildMouseLeave_}
        zoom={this.props.zoom}
        options={K_MAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
}
