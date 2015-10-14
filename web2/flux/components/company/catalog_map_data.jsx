/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';

import catalogDataStore from 'stores/personal_company_page_data_new_store.js';
import catalogActions from 'actions/personal_company_page_actions.js';
import CatalogMap from './catalog_map.jsx';
import emptyFunction from 'react/lib/emptyFunction';

@rafStateUpdate(() => ({
  zoom: catalogDataStore.getMapInfo().get('zoom'),
  center: catalogDataStore.getMapInfo().get('center'),
  visibleRows: catalogDataStore.getVisibleRows(),
  dataResults: catalogDataStore.getSortedData(),
  hoveredRowIndex: catalogDataStore.getHoveredRowIndex(),
  activeAddressId: catalogDataStore.getActiveAddressId(),
  onRowAddressActive: catalogActions.rowAddressActive,
  onRowMapHover: catalogActions.rowMapHover,
  oMapBoundsChange: catalogActions.mapBoundsChange
}), catalogDataStore)
export default class CatalogMapData1 extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any.isRequired,
    zoom: PropTypes.number.isRequired,
    visibleRows: PropTypes.any.isRequired,
    dataResults: PropTypes.any.isRequired,
    hoveredRowIndex: PropTypes.number,
    activeAddressId: PropTypes.any,
    mapMargin: PropTypes.array,
    onRowAddressActive: PropTypes.func,
    onRowMapHover: PropTypes.func,
    oMapBoundsChange: PropTypes.func
  }

  static defaultProps = {
    mapMargin: [30, 30, 30, 30]
  };

  constructor(props) {
    super(props);
  }
  render() {
    return (<CatalogMap {...this.props} className="h200px mB20"/>);
  }
}
