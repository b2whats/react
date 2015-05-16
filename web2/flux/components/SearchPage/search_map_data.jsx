/**
* пример карты гугла
*/
import React, {PropTypes, Component} from 'react/addons';
import rafStateUpdate, {stateUpdate} from 'components/hoc/raf_state_update.js';

import searchDataStoreAP from 'stores/searchDataStoreAP.js';
import searchDataStoreAS from 'stores/searchDataStoreAS.js';
import searchActionsAP from 'actions/searchActionsAP.js';
import searchActionsAS from 'actions/searchActionsAS.js';
import SearchMap from './search_map.jsx';


@rafStateUpdate(() => ({
  zoom: searchDataStoreAP.getMapInfo().get('zoom'),
  center: searchDataStoreAP.getMapInfo().get('center'),
  visibleRowsAP: searchDataStoreAP.getVisibleRows(),
  dataResultsAP: searchDataStoreAP.getSortedData(),
  hoveredRowIdAP: searchDataStoreAP.getHoveredRowIndex(),
  visibleRowsAS: searchDataStoreAS.getVisibleRows(),
  dataResultsAS: searchDataStoreAS.getSortedData(),
  hoveredRowIdAS: searchDataStoreAS.getHoveredRowIndex(),
  activeAddressId: searchDataStoreAP.getActiveAddressId(),
}), searchDataStoreAP, searchDataStoreAS)
export default class SearchMapData extends Component {
  static propTypes = {
    className: PropTypes.string,
    center: PropTypes.any.isRequired,
    zoom: PropTypes.number.isRequired,
    visibleRowsAP: PropTypes.any.isRequired,
    dataResultsAP: PropTypes.any.isRequired,
    hoveredRowIdAP: PropTypes.number,
    visibleRowsAS: PropTypes.any.isRequired,
    dataResultsAS: PropTypes.any.isRequired,
    hoveredRowIndexAS: PropTypes.number,
    mapMargin: PropTypes.array
  }

  static defaultProps = {
    mapMargin: [30, 30, 30, 30]
  };

  constructor(props) {
    super(props);
  }

  onRowAddressActive(...args) {
    console.log(...args);
    // Один метод на 2 сторы с балунами !!! Записываем только в 1 стору
    searchActionsAP.rowAddressActive(...args);
  }
  onRowMapHover(rowIndex, type, val) {
    if (type === 'autoservices'){
      searchActionsAS.rowMapHover(rowIndex, val);
    }
    if (type === 'autoparts'){
      searchActionsAP.rowMapHover(rowIndex, val);
    }
  }
  oMapBoundsChange(...args) {
    searchActionsAP.mapBoundsChange(...args);
    searchActionsAS.mapBoundsChange(...args);
  }
  render() {
    console.log(this.props.activeAddressId);
    return (<SearchMap {...this.props} onRowAddressActive={this.onRowAddressActive} onRowMapHover={this.onRowMapHover} oMapBoundsChange={this.oMapBoundsChange} />);
  }
}
