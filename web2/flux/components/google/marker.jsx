'use strict';
import React, {PropTypes, Component} from 'react/addons';
//import controllable from 'react-controllables';
import cx from 'classnames';

var shallowEqual = require('react/lib/shallowEqual.js');

export default class CatalogPageRightBlockContentNew extends Component {
  static propTypes = {
  };

  static defaultProps = {
  };

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
  }


  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div className={cx('map-marker-holder map-marker-holder--as hint hint--top hint--info hint-html', this.props.hover ? 'hint--always hover' : 'hint--hidden')}>
        <div className="map-marker map-marker--as"></div>
        <div className="hint-content noevents map-marker-holder__small-hint">
          {this.props.marker.get('title')}<strong>я хтмл</strong> хоть <i>с картинками</i> хоть без
        </div>
      </div>
    );
  }
};
