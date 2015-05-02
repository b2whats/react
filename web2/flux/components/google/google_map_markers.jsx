'use strict';
var _ = require('underscore');
var event_names = require('shared_constants/event_names.js');

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var cx        = React.addons.classSet;

var raf = require('utils/raf.js');


var GoogleMapMarkers = React.createClass({
  //mixins: [PureRenderMixin],
  _getState() {
    return {
      children: this.props.dispatcher.get_children()
    };
  },

  _onChangeHandler () {
    var state = this._getState();
    if(this.isMounted()){
      this.replaceState(state);
    }
  },

  _getDimensions(key) {
    var cache_key = '__' + key;
    return this.dimesions_cache_[cache_key];
  },

  getInitialState: function() {
    return this._getState();
  },

  componentWillMount() {
    this.event_disabler = this.props.dispatcher.on(event_names.kON_CHANGE, this._onChangeHandler);
    this.dimesions_cache_ = {};
  },
  
  componentWillUnmount() {
    this.event_disabler();
    delete this.event_disabler;
  },

  render () {
    this.dimesions_cache_ = {};

    var markers = React.Children.map(this.state.children, child => {
      
      var pt = this.props.geo_service.project({lat: child.props.lat, lng: child.props.lng});      
      
      var style_pt_pos = {
        left: `${pt.x}px`,
        top: `${pt.y}px`
      };
      
      var cache_key = '__' + child.key;
      this.dimesions_cache_[cache_key] = {x: pt.x, y: pt.y};
      
      return (
        <div key={child.key} className="map-marker-holder" style={Object.assign({}, style, style_pt_pos)}>
          { React.cloneElement(child, {getDimensions: this._getDimensions})}
        </div>
      );
    });

    return (
      <div>
        {markers}
      </div>
    );
  }
});


var style = {
  width: '2px',
  height: '2px',
  left: 0,
  top: 0,
  backgroundColor: 'red',
  position: 'absolute',
};

module.exports = GoogleMapMarkers;

