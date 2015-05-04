'use strict';
/**
* Карта гугла с отложенной загрузкой
*/
var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
//var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var sc = require('shared_constants');

var GoogleMap = require('components/google/google_map.js');
var Marker = require('./marker.jsx');


var Geo = require('utils/geo.js');

var kMAP_OPTIONS = null; //options to create map

var raf = require('utils/raf.js');
var immutable = require('immutable');

//59.724465, 30.080121

var GoogleMapBlockNew = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() {

  var markers = [
      {
        id: '111',
        lat: 59.724465,
        lng: 30.080121,
        title: '1 1 1 1',
        description: 'wowowowoowo',
      },

      {
        id: '222',
        lat: 59.724965,
        lng: 30.081521,
        title: '2 2 2 2 2 2',
        description: 'wowowowoowo',
      },

      {
        id: '333',
        lat: 59.704965,
        lng: 30.081521,
        title: '3 3 3 3 3',
        description: 'wowowowoowo',
      },

      {
        id: '444',
        lat: 59.724965,
        lng: 30.181521,
        title: '4 4 4',
        description: 'wowowowoowo',
      },
    ];

    for(var i=0;i!=50;++i) {
      markers.push({
        id: '' + i,
        lat: 59.724965 + (Math.random() - 0.5),
        lng: 30.181521 + (Math.random() - 0.5),
        title: `${i} ${i} ${i}`,
        description: 'wowowowoowo',
      });
    }


    return {
      center : [59.744465, 30.042834],
      zoom: 8,
      markers: immutable.fromJS(markers),
    };
  },

  _onCenterChange (center, bounds, zoom) {
    raf( () => this.setState({center, zoom}) ); //эмулируем стору и раф апдейт
  },

  on_hover(id, hover) {    
  },

  on_click(id) {
  },

  componentDidMount() {
    //setTimeout(()=> this.setState({center: [58.744465, 31.042834], zoom: 6}), 5000);
  },

  render () {
    
    var Markers = this.state.markers.map ( marker => (
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
        center={this.state.center}
        onCenterChange={this._onCenterChange}
        zoom={this.state.zoom}
        options={kMAP_OPTIONS}>
        {Markers}
      </GoogleMap>
    );
  }
});

module.exports = GoogleMapBlockNew;
