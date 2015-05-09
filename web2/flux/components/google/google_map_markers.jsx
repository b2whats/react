const React = require('react/addons');
const PropTypes = React.PropTypes;

const PureRenderMixin = React.addons.PureRenderMixin;

const raf = require('utils/raf.js');

let __internalCounter__ = 0;

const style = {
  width: '0px',
  height: '0px',
  left: 0,
  top: 0,
  backgroundColor: 'transparent',
  position: 'absolute'
};

const GoogleMapMarkers = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    geo_service: PropTypes.any,
    distanceToMouse: PropTypes.func,
    dispatcher: PropTypes.any,
    onChildMouseLeave: PropTypes.func,
    onChildMouseEnter: PropTypes.func,
    hoverDistance: PropTypes.number
  },

  _getState() {
    return {
      children: this.props.dispatcher.get_children()
    };
  },

  _onChangeHandler() {
    const state = this._getState();
    if (this.isMounted()) {
      this.setState(state);
    }
  },

  _clearHoverState() {
    const hoverKey = this.hoverKey;

    if (hoverKey) {
      if (this.props.onChildMouseLeave) {
        this.props.onChildMouseLeave(hoverKey);
      }
      // потом добавить проверку что уже не сеттили
      this.hoverKey = null;
      this.setState({hoverKey: null});
    }
  },

  _onMouseChangeHandler() {
    // clearTimeout(this._updateTimer);
    // this._updateTimer = setTimeout(() => this.dimesions_cache_ && this._onMouseChangeHandler_raf(), 100);
    raf(() => this.dimesions_cache_ && this._onMouseChangeHandler_raf(), null, this.__internal__display_name__);
  },

  _onMouseChangeHandler_raf() {
    const mp = this.props.dispatcher.get_mouse_position();
    if (mp) {
      let distances = [];

      React.Children.forEach(this.state.children, child => {
        const dist = this.props.distanceToMouse(this.dimesions_cache_ && this.dimesions_cache_[child.key], mp, child.props);
        if (dist < this.props.hoverDistance) {
          // console.log(child.key, dist);
          distances.push(
            {
              key: child.key,
              dist: dist
            });
        }
      });

      if (distances.length) {
        // console.log('==========');
        distances.sort((a, b) => a.dist - b.dist);
        const hoverKey = distances[0].key;

        if (this.hoverKey !== hoverKey) {
          if (this.props.onChildMouseLeave) {
            this.props.onChildMouseLeave(this.hoverKey);
          }
          if (this.props.onChildMouseEnter) {
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
    const cacheKey = key;
    return this.dimesions_cache_[cacheKey];
  },

  getInitialState() {
    return Object.assign({}, this._getState(), {hoverKey: null});
  },

  componentWillMount() {
    this.event_disabler = this.props.dispatcher.on('kON_CHANGE', this._onChangeHandler);
    this.mouse_event_disabler = this.props.dispatcher.on('kON_MOUSE_POSITION_CHANGE', this._onMouseChangeHandler, 0);
    this.dimesions_cache_ = {};
    this.__internal__display_name__ = this.constructor.displayName + '__' + __internalCounter__++;
    this.hoverKey = null;
    this._updateTimer = null;
    /*
    setTimeout(() => {
      console.log('START'); // eslint-disable-line no-console
      React.addons.Perf.start();
    }, 3000);

    setTimeout(() => {
      React.addons.Perf.stop();
      React.addons.Perf.printInclusive();
    }, 13000); */
  },

  componentWillUnmount() {
    if (this.event_disabler) {
      this.event_disabler();
    }
    if (this.mouse_event_disabler) {
      this.mouse_event_disabler();
    }
    this.dimesions_cache_ = null;
  },

  render() {
    this.dimesions_cache_ = {};

    const markers = React.Children.map(this.state.children, child => {
      const pt = this.props.geo_service.project({lat: child.props.lat, lng: child.props.lng});

      const stylePtPos = {
        left: `${pt.x}px`,
        top: `${pt.y}px`
      };

      const cacheKey = child.key;
      this.dimesions_cache_[cacheKey] = {x: pt.x, y: pt.y, lat: child.props.lat, lng: child.props.lng};

      return (
        <div key={child.key} style={Object.assign({}, style, stylePtPos)}>
          {React.cloneElement(child, {hover: child.key === this.state.hoverKey, getDimensions: this._getDimensions})}
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

module.exports = GoogleMapMarkers;

