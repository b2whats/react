import React, {PropTypes, Component } from 'react/addons';

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
import Col from 'fixed-data-table-ice/internal/FixedDataTableCell.react';
import flexGrow from 'fixed-data-table-ice/internal/FixedDataTableWidthHelper';
import statisticsActions from 'actions/statisticsActions.js';

// DATA DEFINITION
const columns = [
  {
    dataKey: 'description',
    flexGrow: 2,
    label: '',
    width: 150,
    cellClassName: 'bL1s bR1s bc-grey-400'
  },
  {
    dataKey: 'comment',
    flexGrow: 2,
    label: '',
    width: 300,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'manufacturer/code',
    flexGrow: 1,
    label: '',
    width: 130,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'name/email',
    flexGrow: 1,
    label: '',
    width: 130,
    cellClassName: 'bR1s bc-grey-400'
  },
  {
    dataKey: 'date',
    flexGrow: 1,
    label: '',
    width: 80,
    cellClassName: 'bR1s bc-grey-400'
  },
];

export {columns};
function getTotalWidth(/*array*/ columns) /*number*/ {
  var totalWidth = 0;
  for (var i = 0; i < columns.length; ++i) {
    totalWidth += columns[i].width;
  }
  return totalWidth;
}

function getTotalFlexGrow(/*array*/ columns) /*number*/ {
  var totalFlexGrow = 0;
  for (var i = 0; i < columns.length; ++i) {
    totalFlexGrow += columns[i].flexGrow || 0;
  }
  return totalFlexGrow;
}

function distributeFlexWidth(
  /*array*/ columns,
  /*number*/ flexWidth
) /*object*/ {
  if (flexWidth <= 0) {
    return {
      columns: columns,
      width: getTotalWidth(columns),
    };
  }
  var remainingFlexGrow = getTotalFlexGrow(columns);
  var remainingFlexWidth = flexWidth;
  var newColumns = [];
  var totalWidth = 0;
  for (var i = 0; i < columns.length; ++i) {
    var column = columns[i];
    if (!column.flexGrow) {
      totalWidth += column.width;
      newColumns.push(column);
      continue;
    }
    var columnFlexWidth = Math.floor(
      column.flexGrow / remainingFlexGrow * remainingFlexWidth
    );
    var newColumnWidth = Math.floor(column.width + columnFlexWidth);
    totalWidth += newColumnWidth;

    remainingFlexGrow -= column.flexGrow;
    remainingFlexWidth -= columnFlexWidth;

    newColumns.push(Object.assign({}, column, {width: newColumnWidth}));
  }

  return {
    columns: newColumns,
    width: totalWidth,
  };
}
function adjustColumnWidths(
  /*array*/ columns,
  /*number*/ expectedWidth
) /*array*/ {
  var columnsWidth = getTotalWidth(columns);
  if (columnsWidth < expectedWidth) {
    return distributeFlexWidth(columns, expectedWidth - columnsWidth).columns;
  }
  return columns;
}


function renderDescriptionColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div
      className={cx('fs12', rowData.getIn(['services_id']) === 2 ?  'autoservices-bg1' : 'autoparts-bg1')}
      style={{  backgroundRepeat: 'no-repeat', backgroundSize: '30px',  backgroundPosition: '98% 50%'}}
      >
      {rowData.getIn(['services_id']) === 2 ?
        <span>{rowData.getIn(['sender', 'searchap', 'name'])}<br/>{rowData.getIn(['sender', 'searchas', 'service'])}</span>
        :
        rowData.getIn(['subject', 'name'])
      }
    </div>
  );
}
function renderCommentColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className={cx('fs12')}>
      {rowData.getIn(['sender', 'comment'])}
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
      {`${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`}<br/>
      {`в ${date.getHours()}:${date.getMinutes()}`}

    </div>
  );
}
function renderDescription() {
  return <span>Заявка</span>;
}
function renderComment() {
  return <span>Комментарий</span>;
}
function renderMC() {
  return <span className="d-ib"><span>Производитель/<br/>Код</span></span>;
}
function renderNE() {
  return <span className="d-ib"><span>Имя/<br/>Почта</span></span>;
}
function renderP() {
  return <span>Телефон</span>;
}
function renderDate() {
  return <span>Дата</span>;
}
function renderHeader(cellDataKey, {width}) {
  let newColumns = adjustColumnWidths(columns, width);
//console.log(11111111);
  return (
    <div className={cx('fs12 bB1s bc-grey-400')}>
      <Col height={40} cellRenderer={renderDescription} rowIndex={1} className='bL1s bR1s bc-grey-400 bgc-grey-100 d-ib va-T fs13' {...newColumns[0]}/>
      <Col height={40} cellRenderer={renderComment} rowIndex={1} className='bR1s bc-grey-400 bgc-grey-100 d-ib va-T fs13' {...newColumns[1]}/>
      <Col height={40} cellRenderer={renderMC} rowIndex={2} className='bR1s bc-grey-400  bgc-grey-100 d-ib va-T fs13' {...newColumns[2]}/>
      <Col height={40} cellRenderer={renderNE} rowIndex={3} className='bR1s bc-grey-400  bgc-grey-100 d-ib va-T fs13' {...newColumns[3]}/>
      <Col height={40} cellRenderer={renderDate} rowIndex={5} className='bR1s bc-grey-400  bgc-grey-100 d-ib va-T fs13' {...newColumns[4]}/>

    </div>
  );
}
export function getRowClassNameAt(i, isHovered, isFirstInvisibleRow) {

  return i % 2 > 0 ? 'bgc-grey-100 p5-0' : 'p5-0 mR10'
}

export function cellRenderer(cellDataKey, rowData, rowIndex) {
  switch (cellDataKey) {
  case 'description':
    return renderDescriptionColumn(cellDataKey, rowData, rowIndex);
  case 'comment':
    return renderCommentColumn(cellDataKey, rowData, rowIndex);
  case 'manufacturer/code':
    return renderManCodeColumn(cellDataKey, rowData, rowIndex);
  case 'name/email':
    return renderNameEmailColumn(cellDataKey, rowData, rowIndex);
  case 'phone':
    return renderPhoneColumn(cellDataKey, rowData, rowIndex);
  case 'date':
    return renderDateColumn(cellDataKey, rowData, rowIndex);
  case 'header':
    return renderHeader(cellDataKey, rowData);
  default:
    return (
      <div>{rowData ? 'Привет мир' : ''}</div>
    );
  }
}

