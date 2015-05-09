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


import catalogDataStore from 'stores/catalog_data_store_new.js';
import catalogActions from 'actions/catalog_data_actions_new.js';

const K_MAP_OPTIONS = null; // options to create map
const K_MARKERS_COUNT = 50;

const markers = new immutable
  .Range(0, K_MARKERS_COUNT)
  .map(i => new immutable.Map({
    id: '' + i,
    lat: 59.724965 + (Math.random() - 0.5),
    lng: 30.181521 + (Math.random() - 0.5),
    title: `${i} ${i} ${i}`,
    description: 'wowowowoowo',
    c: 0
  })).toList();

@controllable(['markers'])
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
    markers: PropTypes.any,
    visibleRows: PropTypes.any,
    catalogResults: PropTypes.any
  }

  static defaultProps = {
    markers
  };

  constructor(props) {
    super(props);
  }

  _onCenterChange = (center, bounds, zoom) => {
    catalogActions.mapBoundsChange(center, bounds, zoom);
  }

  render() {
    // this.props.catalogResults.map()

    const rowFrom = this.props.visibleRows.get('visibleRowFirst');
    const rowTo = this.props.visibleRows.get('visibleRowLast');
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
