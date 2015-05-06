'use strict';
/**
* Карта гугла с отложенной загрузкой
*/
import React, {PropTypes, Component} from 'react/addons';
import controllable from 'react-controllables';
import immutable from 'immutable';

import GoogleMap  from 'components/google/google_map.js';
import Marker from './marker.jsx';
import raf from 'utils/raf.js';


let markers = immutable
  .Range(0, 50)
  .map(i => immutable.Map({
    id: '' + i,
    lat: 59.724965 + (Math.random() - 0.5),
    lng: 30.181521 + (Math.random() - 0.5),
    title: `${i} ${i} ${i}`,
    description: 'wowowowoowo',
    c: 0,
  })).toList();

const kMAP_OPTIONS = null; //options to create map

@controllable(['center', 'zoom', 'markers'])
export default class GoogleMapBlockNew extends Component {

  static propTypes = {
    onCenterChange: PropTypes.func,
    onZoomChange: PropTypes.func,
    className: PropTypes.string
  }

  static defaultProps = {
    center: [59.744465, 30.042834],
    zoom: 8,
    markers
  };

  constructor(props) {
    super(props);
  }

  _onCenterChange = (center, bounds, zoom) => {
    raf( () => {
      this.props.onCenterChange(center);
      this.props.onZoomChange(zoom);
      //this.setState({center, zoom})
    }); //эмулируем стору и раф апдейт
  }


  componentDidMount() {
    //setTimeout(()=> this.setState({center: [58.744465, 31.042834], zoom: 6}), 5000); //пример как мувить карту
    //setInterval(() => this.setState({markers: this.state.markers.map((m,index) => index<5 ? m.set('c', m.get('c') + 1) : m)}), 16); //пример кучи апдейтов и перерисовок
  }

  render () {

    var Markers = this.props.markers.map ( marker => (
        <Marker
          on_click={this.on_click}
          on_hover={this.on_hover}
          key={marker.get('id')}
          lat={marker.get('lat')}
          lng={marker.get('lng')}
          marker={marker} />
    )).toJS();

    return (
      <GoogleMap
        className={this.props.className}
        center={this.props.center}
        onCenterChange={this._onCenterChange}
        zoom={this.props.zoom}
        options={kMAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
}
