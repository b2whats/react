'use strict';
var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;
var cx        = React.addons.classSet;

var raf = require('utils/raf.js');

var __internal__counter__ = 0;

var GoogleMapMarkers = React.createClass({
  mixins: [PureRenderMixin],
  
  propTypes: {
    geo_service: PropTypes.any,
    distanceToMouse: PropTypes.func,
    dispatcher: PropTypes.any,
  },
  
  _getState() {
    return {
      children: this.props.dispatcher.get_children()
    };
  },

  _onChangeHandler () {
    var state = this._getState();
    if(this.isMounted()){
      this.setState(state);
    }
  },

  _clearHoverState() {
    var hoverKey = this.hoverKey;
    
    if(hoverKey) {
      if(this.props.onChildMouseLeave) {
        this.props.onChildMouseLeave(hoverKey);
      }
      //потом добавить проверку что уже не сеттили
      this.hoverKey = null;
      this.setState({hoverKey: null});    
    }
  },

  _onMouseChangeHandler() {
    raf(() => this.dimesions_cache_ && this._onMouseChangeHandler_raf(), null, this.__internal__display_name__);
  },

  _onMouseChangeHandler_raf() {    
    var mp = this.props.dispatcher.get_mouse_position();
    if(mp) {
      var distances = [];

      React.Children.forEach(this.state.children, child => {
        var dist = this.props.distanceToMouse(this.dimesions_cache_ && this.dimesions_cache_[child.key], mp, child.props);
        if(dist < this.props.hoverDistance) {
          //console.log(child.key, dist);
          distances.push(      
            {
              key: child.key, 
              dist: dist,
            });
        }
      });
      
      if(distances.length) {
        //console.log('==========');
        distances.sort((a, b) => a.dist - b.dist);
        var hoverKey = distances[0].key;
        
        if(this.hoverKey !== hoverKey) {
          if(this.props.onChildMouseLeave) {
            this.props.onChildMouseLeave(this.hoverKey);
          }
          if(this.props.onChildMouseEnter) {
            this.props.onChildMouseEnter(hoverKey);
          }

          this.hoverKey = hoverKey;
          this.setState({hoverKey: hoverKey});
        }
  
      } else {
        this._clearHoverState();
      }
    } else {
      this._clearHoverState();
    }

  },

  _getDimensions(key) {
    var cache_key = key;
    return this.dimesions_cache_[cache_key];
  },

  getInitialState: function() {
    return Object.assign({}, this._getState(), {hoverKey: null});
  },

  componentWillMount() {
    this.event_disabler = this.props.dispatcher.on('kON_CHANGE', this._onChangeHandler);
    this.mouse_event_disabler = this.props.dispatcher.on('kON_MOUSE_POSITION_CHANGE', this._onMouseChangeHandler, 0);    
    this.dimesions_cache_ = {};
    this.__internal__display_name__ = this.constructor.displayName + '__' + __internal__counter__++;
    this.hoverKey = null;
  },
  
  componentWillUnmount() {
    if(this.event_disabler) {
      this.event_disabler();
    }
    if(this.mouse_event_disabler) {
      this.mouse_event_disabler();
    }
    this.dimesions_cache_ = null;
  },

  render () {
    this.dimesions_cache_ = {};

    var markers = React.Children.map(this.state.children, child => {
      
      var pt = this.props.geo_service.project({lat: child.props.lat, lng: child.props.lng});      
      
      var style_pt_pos = {
        left: `${pt.x}px`,
        top: `${pt.y}px`
      };
      
      var cache_key = child.key;
      this.dimesions_cache_[cache_key] = {x: pt.x, y: pt.y, lat: child.props.lat, lng: child.props.lng};      
      
      return (
        <div key={child.key} style={Object.assign({}, style, style_pt_pos)}>
          { React.cloneElement(child, {hover: child.key === this.state.hoverKey, getDimensions: this._getDimensions})}
        </div>
      );
    });

    return (
      <div className="map-markers-plane">
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

