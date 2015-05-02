'use strict';
import React, {PropTypes, Component} from 'react/addons';
//import controllable from 'react-controllables';

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
    //console.log(this.props.marker.get('title'));
    return (
      <div className="map-marker map-marker--as hint hint--top hint--info hint-html">
        <div>J</div>
        <div className="hint-content noevents map-marker__small-hint">
          привет мир <strong>я хтмл</strong> хоть <i>с картинками</i> хоть без
        </div>
      </div>
    );
  }
};
