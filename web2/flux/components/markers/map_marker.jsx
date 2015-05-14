import React, {PropTypes, Component} from 'react/addons';
import cx from 'classnames';

import shallowEqual from 'react/lib/shallowEqual.js';

// TODO перейти на jss вместо sass
import {mapMarker} from 'common_vars.json';

const K_MARKER_WIDTH = +mapMarker.width.replace('px', '');
const K_MARKER_HEIGHT = +mapMarker.height.replace('px', '');
const K_MARKER_OFFSET = +mapMarker.offset; // маркер тычка не симметричная

const K_SCALE_HOVER = 1;
const K_SCALE_TABLE_HOVER = 1;
const K_SCALE_NORMAL = 0.6;

// const K_MIN_GRAYSCALE = 0.0;
const K_MIN_CONTRAST = 0.4;


function getHintBaloonStyle({x}, mapWidth, mapHeight) {
  const K_BALLOON_WIDTH = 250;
  // на сколько пикселей я хочу чтобы балун смещался от центра стрелки
  const K_BALLOON_DEFAULT_OFFSET = K_BALLOON_WIDTH * 0.5;
  // надо пересчитать в смещении от угла
  const offset = -K_BALLOON_DEFAULT_OFFSET + K_MARKER_WIDTH * 0.5;
  // на сколько пикселей такой балун будет вылезать за пределы экрана по ширине (см. несимметричность маркера)
  const leftX = x + offset - K_MARKER_WIDTH * K_MARKER_OFFSET;
  const rightX = leftX + K_BALLOON_WIDTH;
  // если rightX или leftX вылезают надо пересчитать

  const K_BALLOON_WIDTH_STYLE = {
    width: `${K_BALLOON_WIDTH}px`,
    left: `${offset}px`,
    marginLeft: '0px'
  };

  return K_BALLOON_WIDTH_STYLE;
}

export {K_SCALE_NORMAL, K_MARKER_WIDTH, K_MARKER_HEIGHT};

export default class MapMarker extends Component {
  static propTypes = {
    $hover: PropTypes.bool,
    $dimensionKey: PropTypes.any,
    $getDimensions: PropTypes.func,
    $geoService: PropTypes.any,

    marker: PropTypes.any,
    hoveredAtTable: PropTypes.bool,
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
    let scale = this.props.$hover ? K_SCALE_HOVER : this.props.scale;
    scale = this.props.hoveredAtTable ? K_SCALE_TABLE_HOVER : scale;
    // const grayscale = 1 + Math.max(0, Math.min(scale / K_SCALE_NORMAL, 1)) * (K_MIN_GRAYSCALE - 1);
    const contrast = K_MIN_CONTRAST + (1 - K_MIN_CONTRAST) * Math.min(scale / K_SCALE_NORMAL, 1);

    const scaleStyle = {
      transform: `scale(${scale} , ${scale})`,
      WebkitTransform: `scale(${scale} , ${scale})`,
      filter: `contrast(${contrast})`,
      // WebkitFilter: `grayscale(${grayscale}) contrast(${contrast})`,
      WebkitFilter: `contrast(${contrast})`,
      zIndex: Math.round(scale * 10000)
    };

    const showHint = this.props.$hover; // || this.props.hoveredAtTable;

    // разобрацо переходит ли или потеря
    const mapWidth = this.props.$geoService.getWidth();
    const mapHeight = this.props.$geoService.getHeight();
    const markerDim = this.props.$getDimensions(this.props.$dimensionKey);

    const hintBaloonStyle = getHintBaloonStyle(markerDim, mapWidth, mapHeight);

    return (
      <div
        className={cx('map-marker hint hint--top hint--info hint-html',
          showHint ? 'hint--always hover' : 'hint--hidden')}>
        <div style={scaleStyle} className={cx('map-marker__marker', this.props.marker.get('filial_type_id') === 1 ? 'map-marker__marker--ap' : 'map-marker__marker--as')}></div>
        <div style={hintBaloonStyle} className="hint-content noevents">
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
