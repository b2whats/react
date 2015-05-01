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


var GoogleMapBlockNew = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() {
    return {
      center : [59.744465, 30.042834],
      zoom: 8
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
    setTimeout(()=> this.setState({center: [58.744465, 31.042834], zoom: 6}), 5000);
  },

  render () {
    /*
    var Markers = this.state.markers.map ( marker => (
        <Marker
          on_click={this.on_click}
          on_hover={this.on_hover}
          key={marker.get('rid')}
          lat={marker.get('lat')}
          lng={marker.get('lng')}
          marker={marker} />
    )).toJS();
    */
    return (
      <GoogleMap
        className={this.props.className}
        center={this.state.center}
        onCenterChange={this._onCenterChange}
        zoom={this.state.zoom}
        options={kMAP_OPTIONS}>
        {/*Markers*/}
      </GoogleMap>
    );
  }
});

module.exports = GoogleMapBlockNew;
