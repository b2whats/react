/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';


import CatalogMap from './map.jsx';
import emptyFunction from 'react/lib/emptyFunction';


export default class CatalogMapData1 extends Component {

  static defaultProps = {
    mapMargin: [30, 30, 30, 30],
    zoom: 17,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (<CatalogMap {...this.props} className="h230px w100pr"/>);
  }
}
