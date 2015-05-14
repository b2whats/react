import React, {PropTypes, Component} from 'react/addons';
import cx from 'classnames';

import shallowEqual from 'react/lib/shallowEqual.js';

import {mapMarker} from 'common_vars.json';

const K_MARKER_WIDTH = +mapMarker.width.replace('px', '');
const K_MARKER_HEIGHT = +mapMarker.height.replace('px', '');
const K_BALLOON_WIDTH = 250;

const K_SCALE_HOVER = 1;
const K_SCALE_TABLE_HOVER = 1;
const K_SCALE_NORMAL = 0.6;

const K_MIN_BRIGHTNESS = 0.6;
const K_MIN_CONTRAST = 0.4;


const K_BALLOON_WIDTH_STYLE = {
  width: '300px',
  left: '-28px',
  marginLeft: '0px'
};

function getHintBaloonStyle(markerDim) {
  //подсчитать смещение
}

export {K_SCALE_NORMAL, K_MARKER_WIDTH, K_MARKER_HEIGHT};

export default class MapMarker extends Component {
  static propTypes = {
    marker: PropTypes.any,
    hover: PropTypes.bool,
    hoveredAtTable: PropTypes.bool,
    scale: PropTypes.number,
    $dimensionKey: PropTypes.any,
    getDimensions: PropTypes.func
  };

  static defaultProps = {
    scale: K_SCALE_NORMAL
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
  }

  render() {
    let scale = this.props.hover ? K_SCALE_HOVER : this.props.scale;
    scale = this.props.hoveredAtTable ? K_SCALE_TABLE_HOVER : scale;


    const brightness = K_MIN_BRIGHTNESS + (1 - K_MIN_BRIGHTNESS) * Math.min(scale / K_SCALE_NORMAL, 1);
    const contrast = K_MIN_CONTRAST + (1 - K_MIN_CONTRAST) * Math.min(scale / K_SCALE_NORMAL, 1);


    const scaleStyle = {
      transform: `scale(${scale} , ${scale})`,
      'WebkitTransform': `scale(${scale} , ${scale})`,
      filter: `contrast(${contrast})`,
      'WebkitFilter': `contrast(${contrast})`,
      zIndex: Math.round(scale * 10000)
      // opacity: brightness
      // filter: `brightness(${brightness})`,
      // '-webkit-filter': `brightness(${brightness})`
    };

    const showHint = this.props.hover; // || this.props.hoveredAtTable;

    // разобрацо переходит ли или потеря
    const markerDim = this.props.getDimensions(this.props.$dimensionKey);
    // console.log('markerDim', markerDim);

    // const hintBaloonStyle = getHintBaloonStyle(markerDim);

    return (
      <div
        className={cx('map-marker hint hint--top hint--info hint-html',
          showHint ? 'hint--always hover' : 'hint--hidden')}>
        <div style={scaleStyle} className={cx('map-marker__marker', this.props.marker.get('filial_type_id') === 1 ? 'map-marker__marker--ap' : 'map-marker__marker--as')}></div>
        <div style={K_BALLOON_WIDTH_STYLE} className="hint-content noevents">
          <div>
            <strong>{this.props.marker.get('company_name')}</strong>
          </div>
          <div>
           <a className="ap-link">кликни на маркер для информации</a>
          </div>
        </div>
      </div>
    );
  }
}
