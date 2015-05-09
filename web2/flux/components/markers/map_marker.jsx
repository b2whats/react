import React, {PropTypes, Component} from 'react/addons';
import cx from 'classnames';

import shallowEqual from 'react/lib/shallowEqual.js';

const K_SCALE_HOVER = 1;
const K_SCALE_NORMAL = 0.6;

const K_MIN_BRIGHTNESS = 0.6;
const K_MIN_CONTRAST = 0.4;

export {K_SCALE_NORMAL};

export default class MapMarker extends Component {
  static propTypes = {
    marker: PropTypes.any,
    hover: PropTypes.bool,
    scale: PropTypes.number
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
    // const brightness = K_MIN_BRIGHTNESS + (1 - K_MIN_BRIGHTNESS) * Math.min(this.props.scale / K_SCALE_NORMAL, 1);
    const scale = this.props.hover ? K_SCALE_HOVER : this.props.scale;
    const brightness = K_MIN_BRIGHTNESS + (1 - K_MIN_BRIGHTNESS) * Math.min(scale / K_SCALE_NORMAL, 1);
    const contrast = K_MIN_CONTRAST + (1 - K_MIN_CONTRAST) * Math.min(scale / K_SCALE_NORMAL, 1);

    // пропорционально скейлу
    const zIndexStyle = {
      zIndex: Math.round(scale * 10000)
    };

    const scaleStyle = {
      transform: `scale(${scale} , ${scale})`,
      // opacity: brightness
      // filter: `brightness(${brightness})`,
      // '-webkit-filter': `brightness(${brightness})`
      filter: `contrast(${contrast})`,
      '-webkit-filter': `contrast(${contrast})`

    };
    // this.was_hover = this.was_hover || this.props.hover;
    return (
      <div
        style={zIndexStyle}
        className={cx('map-marker hint hint--top hint--info hint-html',
          (this.props.hover) ? 'hint--always hover' : 'hint--hidden')}>
        <div style={scaleStyle} className={cx('map-marker__marker', this.props.marker.get('filial_type_id') === 1 ? 'map-marker__marker--ap' : 'map-marker__marker--as')}></div>
        <div className="hint-content noevents map-marker__small-hint">
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
