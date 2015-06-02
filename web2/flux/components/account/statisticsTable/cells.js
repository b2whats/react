import React, {PropTypes, Component} from 'react/addons';

import cx from 'classnames';
import Link from 'components/link.jsx';
import regionStore from 'stores/region_store.js';
// import catalogDataActions from 'actions/catalog_data_actions.js';

import catalogDataActionsNew from 'actions/catalog_data_actions_new.js';
import catalogDataStore from 'stores/catalog_data_store_new.js';

const K_ROW_CLASS_NAME_BORDER_LINE = 'catalog-page-table-new-row-border-line';
const K_ROW_CLASS_NAME_EVEN = 'catalog-page-table-new-row-even';
const K_ROW_CLASS_NAME_ODD = 'catalog-page-table-new-row-odd';

const K_ROW_CLASS_NAME_EVEN_HOVERED = 'catalog-page-table-new-row-even catalog-page-table-new-row-even--hovered';
const K_ROW_CLASS_NAME_ODD_HOVERED = 'catalog-page-table-new-row-odd catalog-page-table-new-row-odd--hovered';

import statisticsActions from 'actions/statisticsActions.js';

// DATA DEFINITION
const columns = [
  {
    dataKey: 'description',
    flexGrow: 4,
    label: 'dw',
    width: 200,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'manufacturer/code',
    flexGrow: 1,
    label: 'www',
    width: 150,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'name/email',
    flexGrow: 1,
    label: 'ww',
    width: 150,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'phone',
    flexGrow: 1,
    label: 'qq',
    width: 150,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'date',
    flexGrow: 1,
    label: '212',
    width: 100,
    cellClassName: 'bR1s bc-grey-400'
  },
];

export {columns};

function renderDescriptionColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className={cx('fs12')}>
      {rowData.getIn(['subject', 'name'])}
    </div>
  );
}
function renderManCodeColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className={cx('fs12')}>
      <span className="fw-b">{rowData.getIn(['subject', 'manufacturer'])}</span>
      <br/>
      {rowData.getIn(['subject', 'code'])}
    </div>
  );
}
function renderNameEmailColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className={cx('fs12')}>
      <span className="big-first">{rowData.getIn(['sender', 'name'])}</span>
      <br/>
      <span className="c-grey-500">{rowData.getIn(['sender', 'email'])}</span>
    </div>
  );
}
function renderPhoneColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className={cx('fs12')}>
      <span className="fs14">{rowData.getIn(['sender', 'phone'])}</span>
    </div>
  );
}
function renderDateColumn(cellDataKey, rowData, rowIndex) {
  var date = new Date(rowData.get('date'));
  return (
    <div className={cx('fs12')}>
      {`${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`}<br/>
      {`в ${date.getHours()}:${date.getMinutes()}`}

    </div>
  );
}
export function getRowClassNameAt(i, isHovered, isFirstInvisibleRow) {

  return i % 2 > 0 ? 'bgc-grey-100 p5-0' : 'p5-0 mR10'
}

export function cellRenderer(cellDataKey, rowData, rowIndex) {
  console.log(cellDataKey);
  switch (cellDataKey) {
  case 'description':
    return renderDescriptionColumn(cellDataKey, rowData, rowIndex);
  case 'manufacturer/code':
    return renderManCodeColumn(cellDataKey, rowData, rowIndex);
  case 'name/email':
    return renderNameEmailColumn(cellDataKey, rowData, rowIndex);
  case 'phone':
    return renderPhoneColumn(cellDataKey, rowData, rowIndex);
  case 'date':
    return renderDateColumn(cellDataKey, rowData, rowIndex);
  default:
    return (
      <div>{rowData ? 'Привет мир' : ''}</div>
    );
  }
}

