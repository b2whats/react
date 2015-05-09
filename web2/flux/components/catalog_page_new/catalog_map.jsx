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
  // catalogResults: catalogDataStore.getData(),
  zoom: catalogDataStore.getMapInfo().get('zoom'),
  center: catalogDataStore.getMapInfo().get('center'),
  visibleRows: catalogDataStore.getVisibleRows()
}), catalogDataStore)
export default class CatalogMap extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any,
    zoom: PropTypes.number,
    markers: PropTypes.any
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
    const Markers = this.props.markers.map( marker => (
        <MarkerExample
          on_click={this.on_click}
          on_hover={this.on_hover}
          key={marker.get('id')}
          lat={marker.get('lat')}
          lng={marker.get('lng')}
          marker={marker} />
    ));

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
