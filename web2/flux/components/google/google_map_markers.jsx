'use strict';
var _ = require('underscore');
var event_names = require('shared_constants/event_names.js');

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var cx        = React.addons.classSet;

var raf = require('utils/raf.js');


var GoogleMapMarkers = React.createClass({
  //mixins: [PureRenderMixin],

  get_state() {
    return {
      children: this.props.dispatcher.get_children()
    };
  },

  getInitialState: function() {
    return this.get_state();
  },

  on_change_handler () {
    var state = this.get_state();
    if(this.isMounted()){
      this.replaceState(state);
    }
  },

  componentWillMount() {
    this.event_disabler = this.props.dispatcher.on(event_names.kON_CHANGE, this.on_change_handler);
  },
  
  componentWillUnmount() {
    this.event_disabler();
    delete this.event_disabler;
  },

  render () {

    var markers = React.Children.map(this.state.children, child => {
      
      var pt = this.props.geo_service.project({lat: child.props.lat, lng: child.props.lng});      
      
      var style = {
        //transform: `translate(${pt.x}px, ${pt.y}px)`
        left: `${pt.x}px`,
        top: `${pt.y}px`
      };
      
      return (
        <div key={child.key} className="google_map_marker_holder" style={ style }>
          { React.addons.cloneWithProps(child, {marker_left: pt.x, marker_top: pt.y})}        
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

module.exports = GoogleMapMarkers;

