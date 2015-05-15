import React, {PropTypes, Component} from 'react/addons';

const {PureRenderMixin} = React.addons;

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
    geoService: PropTypes.any,
    distanceToMouse: PropTypes.func,
    dispatcher: PropTypes.any,
    onChildClick: PropTypes.func,
    onChildMouseLeave: PropTypes.func,
    onChildMouseEnter: PropTypes.func,
    hoverDistance: PropTypes.number
  },

  _getState() {
    return {
      children: this.props.dispatcher.getChildren(),
      updateCounter: this.props.dispatcher.getUpdateCounter()
    };
  },

  _onChangeHandler() {
    const state = this._getState();
    if (this.isMounted()) {
      this.setState(state);
    }
  },

  _onChildClick() {
    if (this.props.onChildClick) {
      if (this.childProps) {
        const hoverKey = this.hoverKey;
        const childProps = this.childProps;
        // используем тот факт что кликнуть можно только на уже нахуверенную иконку
        this.props.onChildClick(hoverKey, childProps);
      }
    }
  },

  _onChildMouseEnter(hoverKey, childProps) {
    if (this.props.onChildMouseEnter) {
      this.props.onChildMouseEnter(hoverKey, childProps);
    }

    this.childProps = childProps;
    this.hoverKey = hoverKey;
    this.setState({hoverKey: hoverKey});
  },

  _onChildMouseLeave() {
    const hoverKey = this.hoverKey;
    const childProps = this.childProps;

    if (hoverKey) {
      if (this.props.onChildMouseLeave) {
        this.props.onChildMouseLeave(hoverKey, childProps);
      }

      this.hoverKey = null;
      this.childProps = null;
      this.setState({hoverKey: null});
    }
  },


  _onMouseAllow(value) {
    if (!value) {
      this._onChildMouseLeave();
    }

    this._allowMouse = value;
  },


  _onMouseChangeHandler() {
    if (this._allowMouse) {
      this._onMouseChangeHandler_raf();
    }
  },

  _onMouseChangeHandler_raf() {
    if (!this.dimesions_cache_) {
      return;
    }

    const mp = this.props.dispatcher.getMousePosition();
    if (mp) {
      let distances = [];

      React.Children.forEach(this.state.children, child => {
        const dist = this.props.distanceToMouse(this.dimesions_cache_ && this.dimesions_cache_[child.key], mp, child.props);
        if (dist < this.props.hoverDistance) {
          distances.push(
            {
              key: child.key,
              dist: dist,
              props: child.props
            });
        }
      });

      if (distances.length) {
        distances.sort((a, b) => a.dist - b.dist);
        const hoverKey = distances[0].key;
        const childProps = distances[0].props;

        if (this.hoverKey !== hoverKey) {
          this._onChildMouseLeave();

          this._onChildMouseEnter(hoverKey, childProps);
        }
      } else {
        this._onChildMouseLeave();
      }
    } else {
      this._onChildMouseLeave();
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
    this.childProps = null;
    this.event_disabler = this.props.dispatcher.on('kON_CHANGE', this._onChangeHandler);
    this.mouse_event_disabler = this.props.dispatcher.on('kON_MOUSE_POSITION_CHANGE', this._onMouseChangeHandler, 0);
    this.click_event_disabler = this.props.dispatcher.on('kON_CLICK', this._onChildClick, 0);

    this.dimesions_cache_ = {};
    this.__internal__display_name__ = this.constructor.displayName + '__' + __internalCounter__++;
    this.hoverKey = null;
    this._updateTimer = null;

    this._allowMouse = true;
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

    if (this.click_event_disabler) {
      this.click_event_disabler();
    }

    this.dimesions_cache_ = null;
  },

  render() {
    this.dimesions_cache_ = {};

    const markers = React.Children.map(this.state.children, child => {
      const pt = this.props.geoService.project({lat: child.props.lat, lng: child.props.lng});

      const stylePtPos = {
        left: `${pt.x}px`,
        top: `${pt.y}px`
      };

      // to prevent rerender on child element i need to pass const params $getDimensions and $dimensionKey instead of dimension object
      const cacheKey = child.key;
      this.dimesions_cache_[cacheKey] = {x: pt.x, y: pt.y, lat: child.props.lat, lng: child.props.lng};

      return (
        <div key={child.key} style={Object.assign({}, style, stylePtPos)}>
          {React.cloneElement(child, {
            $hover: child.key === this.state.hoverKey,
            $getDimensions: this._getDimensions,
            $dimensionKey: child.key,
            $geoService: this.props.geoService,
            $onMouseAllow: this._onMouseAllow
          })}
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

