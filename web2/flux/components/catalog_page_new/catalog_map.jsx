/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';
import immutable from 'immutable';

import GoogleMap from 'components/google/google_map.js';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';

import MarkerExample from 'components/markers/map_marker.jsx';
import raf from 'utils/raf.js';

import invariant from 'fixed-data-table-ice/internal/invariant.js';

import catalogDataStore from 'stores/catalog_data_store_new.js';
import catalogActions from 'actions/catalog_data_actions_new.js';

const K_MAP_OPTIONS = null; // options to create map

// {l: 10, scale: 0.3}, {l: 5, scale: 0.4} - означает
// 10 элементов размера 0.3, потом 5 размера 0.4, потом те что видны в табличке обычного размера
// потом снова потом 5 размера 0.4, и 10 элементов размера 0.3
// если поставить пусто то на карте будут видны тока те что на экране
const {getScale, getRealFromTo} = (() => {
  const K_BEFORE_AFTER_SCALES = [{l: 20, scale: 0.3}, {l: 10, scale: 0.4}];
  const K_NORMAL_SCALE = 0.6;
  const K_SCALES_SUM = K_BEFORE_AFTER_SCALES.reduce((sum, el) => el.l + sum, 0);

  return {
    getScale(rowIndex, rowFrom, rowTo) {
      if (rowIndex >= rowFrom && rowIndex <= rowTo) {
        return K_NORMAL_SCALE;
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

          if (__DEV__) {
            invariant(false, 'не должны бы сюда попадать');
          }
        }

        if (rowIndex > rowTo) {
          let deltaS = rowTo;
          for (let index = K_BEFORE_AFTER_SCALES.length - 1; index >= 0; --index) {
            deltaS += K_BEFORE_AFTER_SCALES[index].l;
            if (rowIndex <= deltaS) {
              return K_BEFORE_AFTER_SCALES[index].scale;
            }
          }

          if (__DEV__) {
            invariant(false, 'не должны бы сюда попадать');
          }
        }
      }

      invariant(!K_BEFORE_AFTER_SCALES.length, 'и сюда попадать грех');

      return K_NORMAL_SCALE;
    },

    getRealFromTo(rowFrom, rowTo, totalSize) {
      return {
        rowFrom: Math.max(0, rowFrom - K_SCALES_SUM),
        rowTo: Math.min(totalSize - 1, rowTo + K_SCALES_SUM)
      };
    }
  };
})();

// @controllable(['markers'])
@rafStateUpdate(() => ({
  zoom: catalogDataStore.getMapInfo().get('zoom'),
  center: catalogDataStore.getMapInfo().get('center'),
  visibleRows: catalogDataStore.getVisibleRows(),
  catalogResults: catalogDataStore.getSortedData()
}), catalogDataStore)
export default class CatalogMap extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any,
    zoom: PropTypes.number,
    visibleRows: PropTypes.any,
    catalogResults: PropTypes.any
  }

  static defaultProps = {

  };

  constructor(props) {
    super(props);
  }

  _onCenterChange = (center, bounds, zoom) => {
    catalogActions.mapBoundsChange(center, bounds, zoom);
  }


  render() {
    const visibleRowFrom = this.props.visibleRows.get('visibleRowFirst');
    const visibleRowTo = this.props.visibleRows.get('visibleRowLast');
    const {rowFrom, rowTo} = getRealFromTo(visibleRowFrom, visibleRowTo, this.props.catalogResults.size);
    const emptyIm = new immutable.List();


    const Markers = rowFrom === -1 ? [] : (new immutable.Range(rowFrom, rowTo + 1)).toList()
      .flatMap( rowIndex => {
        const row = this.props.catalogResults.get(rowIndex);

        if (row.get('visible_item')) {
          return row.get('addresses')
            .filter(addr => addr.get('visible_address'))
            .map(addr => (
              <MarkerExample
                key={addr.get('id')}
                lat={addr.get('coordinates').get(0)}
                lng={addr.get('coordinates').get(1)}
                scale={getScale(rowIndex, visibleRowFrom, visibleRowTo)}
                marker={addr} />
            ));
        }
        return emptyIm;
      });

    return (
      <GoogleMap
        className={this.props.className}
        center={this.props.center.toJS()}
        onCenterChange={this._onCenterChange}
        zoom={this.props.zoom}
        options={K_MAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
}
