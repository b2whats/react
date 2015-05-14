import React, {PropTypes, Component} from 'react/addons';
import cx from 'classnames';

import controllable from 'react-controllables';

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

function getHintBaloonVerticalPosClass(y, mapHeight) {
  return 'hint--top';
  // return 'hint--bottom';
}

function getHintBaloonHorizontalPosStyle(x, mapWidth) {
  // какой отступ я хочу от края если возможно
  const K_BALLOON_MAP_OFFSET = 10;
  // ширина балуна не шире карты
  const K_BALLOON_WIDTH = Math.min(250, mapWidth - 2 * K_BALLOON_MAP_OFFSET);
  // на сколько пикселей я хочу чтобы балун смещался от центра стрелки если ему нико не мешает
  const K_BALLOON_DEFAULT_OFFSET = K_BALLOON_WIDTH * 0.15;

  // надо пересчитать в смещении от угла
  const offset = -K_BALLOON_DEFAULT_OFFSET + K_MARKER_WIDTH * 0.5;
  // на сколько пикселей такой балун будет вылезать за пределы экрана по ширине (см. несимметричность маркера)
  const leftX = x + offset - K_MARKER_WIDTH * K_MARKER_OFFSET;
  const rightX = leftX + K_BALLOON_WIDTH;
  // если rightX или leftX или оба вылезают надо пересчитать
  const mapOffset = offset + Math.min(0, (mapWidth - K_BALLOON_MAP_OFFSET) - rightX) + Math.max(0, K_BALLOON_MAP_OFFSET - leftX);


  const K_BALLOON_WIDTH_STYLE = {
    width: `${K_BALLOON_WIDTH}px`,
    left: `${mapOffset}px`,
    marginLeft: '0px'
  };
  return K_BALLOON_WIDTH_STYLE;
}


export {K_SCALE_NORMAL, K_MARKER_WIDTH, K_MARKER_HEIGHT};

@controllable(['hoverState'])
export default class MapMarker extends Component {
  static propTypes = {
    $hover: PropTypes.bool,
    $dimensionKey: PropTypes.any,
    $getDimensions: PropTypes.func,
    $geoService: PropTypes.any,

    marker: PropTypes.any,
    hoveredAtTable: PropTypes.bool,
    scale: PropTypes.number,

    // чтобы разбить хувер анимацию на две части иначе транзишены чудеса дают
    hoverState: PropTypes.bool,
    onHoverStateChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    scale: K_SCALE_NORMAL,
    hoverState: false
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

    const showHint = this.props.hoverState; // || this.props.hoveredAtTable;

    // расчет показа балуна (не показывать вне границ карты)
    const mapWidth = this.props.$geoService.getWidth();
    const mapHeight = this.props.$geoService.getHeight();
    const markerDim = this.props.$getDimensions(this.props.$dimensionKey);

    const hintBaloonHorizontalPosStyle = getHintBaloonHorizontalPosStyle(markerDim.x, mapWidth);
    const hintBaloonVerticalPosClass = getHintBaloonVerticalPosClass(markerDim.y, mapHeight);

    const noTransClass = this.props.$hover === true && this.props.hoverState !== true ? 'hint--notrans' : '';
    // console.log(this.props.$hover, this.props.hoverState, noTransClass);

    return (
      <div
        className={cx('map-marker hint hint--info hint-html',
          noTransClass,
          hintBaloonVerticalPosClass,
          showHint ? 'hint--always' : 'hint--hidden')}>
        <div style={scaleStyle} className={cx('map-marker__marker', this.props.marker.get('filial_type_id') === 1 ? 'map-marker__marker--ap' : 'map-marker__marker--as')}></div>
        <div style={hintBaloonHorizontalPosStyle} className="hint-content noevents">
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

  componentDidUpdate(prevProps) {
    // для сначала выставить балун по горизонтали а потом анимировать - иначе транизишн
    // по горизонтали будет мувить балун после мувов карты поэтому на просто $hover ставицо hint--notrans
    // и только по факту hoverState рисуется подсказка
    if (prevProps.$hover !== this.props.$hover) {
      setTimeout(() => this.props.onHoverStateChange(this.props.$hover), 0);
    }
  }
}
