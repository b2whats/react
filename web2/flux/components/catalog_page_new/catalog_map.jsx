/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';
import immutable from 'immutable';

import GoogleMap from 'components/google/google_map.js';
import MarkerExample from 'components/markers/map_marker.jsx';
import raf from 'utils/raf.js';

import catalogActions from 'actions/catalog_data_actions_new.js';

const K_MAP_OPTIONS = null; // options to create map
const K_MARKERS_COUNT = 150;

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

@controllable(['center', 'zoom', 'markers'])
export default class CatalogMap extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any,
    zoom: PropTypes.number,
    markers: PropTypes.any,
    onCenterChange: PropTypes.func,
    onZoomChange: PropTypes.func
  }

  static defaultProps = {
    center: [59.744465, 30.042834],
    markers,
    zoom: 8
  };

  constructor(props) {
    super(props);
  }

  _onCenterChange = (center, bounds, zoom) => {
    raf( () => {
      this.props.onCenterChange(center);
      this.props.onZoomChange(zoom);
      catalogActions.mapBoundsChange(center, bounds, zoom);
    }); // эмулируем стору и раф апдейт
  }

  componentDidMount() {
    // setTimeout(()=> this.setState({center: [58.744465, 31.042834], zoom: 6}), 5000); //пример как мувить карту
    // setInterval(() =>
    // this.setState({markers: this.state.markers.map((m,index) => index<5 ? m.set('c', m.get('c') + 1) : m)}), 16); //пример кучи апдейтов и перерисовок
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
        center={this.props.center}
        onCenterChange={this._onCenterChange}
        zoom={this.props.zoom}
        options={K_MAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
}
