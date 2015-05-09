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

const K_MAP_OPTIONS = null; // options to create map
const K_HOVER_DISTANCE = 30;
// {l: 10, scale: 0.3}, {l: 5, scale: 0.4} - означает
// 10 элементов размера 0.3, потом 5 размера 0.4, потом те что видны в табличке обычного размера
// потом снова потом 5 размера 0.4, и 10 элементов размера 0.3
// если поставить пусто то на карте будут видны тока те что на экране
const {getScale, getRealFromTo} = (() => {
  const K_SCALE_SMALL = 0.25;
  const K_SCALE_MEDIUM = 0.4;
  const K_BEFORE_AFTER_SCALES = [{l: 15, scale: K_SCALE_SMALL}, {l: 10, scale: K_SCALE_MEDIUM}];
  const K_SCALES_SUM = K_BEFORE_AFTER_SCALES.reduce((sum, el) => el.l + sum, 0);

  return {
    getScale(rowIndex, rowFrom, rowTo) {
      if (rowIndex >= rowFrom && rowIndex <= rowTo) {
        return K_SCALE_NORMAL;
      }

      if (K_BEFORE_AFTER_SCALES.length) {
        if (rowIndex < rowFrom) {
          let deltaS = rowFrom;
          for (let index = K_BEFORE_AFTER_SCALES.length - 1; index >= 0; --index) {
            deltaS -= K_BEFORE_AFTER_SCALES[index].l;
            if (rowIndex >= deltaS) {
              return K_BEFORE_AFTER_SCALES[index].scale;
            }
          }

          // перебор возможен так задумано
          return K_BEFORE_AFTER_SCALES[0].scale;
        }

        if (rowIndex > rowTo) {
          let deltaS = rowTo;
          for (let index = K_BEFORE_AFTER_SCALES.length - 1; index >= 0; --index) {
            deltaS += K_BEFORE_AFTER_SCALES[index].l;
            if (rowIndex <= deltaS) {
              return K_BEFORE_AFTER_SCALES[index].scale;
            }
          }

          // перебор возможен так задумано
          return K_BEFORE_AFTER_SCALES[0].scale;
        }
      }

      invariant(!K_BEFORE_AFTER_SCALES.length, 'и сюда попадать грех');

      return K_SCALE_NORMAL;
    },

    getRealFromTo(rowFrom, rowTo, totalSize) {
      let addFrom = ((rowTo + K_SCALES_SUM) > (totalSize - 1)) ? ((rowTo + K_SCALES_SUM) - (totalSize - 1)) : 0;
      let addTo = rowFrom - K_SCALES_SUM < 0 ? K_SCALES_SUM - rowFrom : 0;


      return {
        rowFrom: Math.max(0, rowFrom - K_SCALES_SUM - addFrom),
        rowTo: Math.min(totalSize - 1, Math.round((rowTo + K_SCALES_SUM + addTo) / 2) * 2 + 1)
      };
    }
  };
})();

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

  render() {
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
                key={addr.get('id')}
                lat={addr.get('coordinates').get(0)}
                lng={addr.get('coordinates').get(1)}
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
        zoom={this.props.zoom}
        options={K_MAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
}
