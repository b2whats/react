import React, {PropTypes, Component} from 'react/addons';
import cx from 'classnames';

import shallowEqual from 'react/lib/shallowEqual.js';

const K_SCALE_HOVER = 1;
const K_SCALE_NORMAL = 0.5;

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
    const scale = this.props.hover ? K_SCALE_HOVER : this.props.scale;

    const scaleStyle = {
      transform: `scale(${scale} , ${scale})`
    };
    // this.was_hover = this.was_hover || this.props.hover;
    return (
      <div className={cx(
        'map-marker hint hint--top hint--info hint-html',
        (this.props.hover) ? 'hint--always hover' : 'hint--hidden')}>
        <div style={scaleStyle} className="map-marker__marker map-marker__marker--as"></div>
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
