import React, {PropTypes, Component} from 'react/addons';
import keyOf from 'utils/keyof.js';
import cx from 'classnames';
import Link from 'components/link.jsx';
import regionStore from 'stores/region_store.js';
// import catalogDataActions from 'actions/catalog_data_actions.js';

import catalogDataActionsNew from 'actions/catalog_data_actions_new.js';
import catalogDataStore from 'stores/catalog_data_store_new.js';

import CatalogRowShowPhone from './catlog_row_show_phone.jsx';

const K_KEY_COLUMN_RANK = keyOf({K_KEY_COLUMN_RANK: null});
const K_KEY_COLUMN_DESCRIPTION = keyOf({K_KEY_COLUMN_DESCRIPTION: null});
const K_KEY_COLUMN_PHONE = keyOf({K_KEY_COLUMN_PHONE: null});

const K_ROW_CLASS_NAME_BORDER_LINE = 'catalog-page-table-new-row-border-line';
const K_ROW_CLASS_NAME_EVEN = 'catalog-page-table-new-row-even';
const K_ROW_CLASS_NAME_ODD = 'catalog-page-table-new-row-odd';

const K_ROW_CLASS_NAME_EVEN_HOVERED = 'catalog-page-table-new-row-even catalog-page-table-new-row-even--hovered';
const K_ROW_CLASS_NAME_ODD_HOVERED = 'catalog-page-table-new-row-odd catalog-page-table-new-row-odd--hovered';

import statisticsActions from 'actions/statisticsActions.js';

// DATA DEFINITION
const columns = [
    {
      dataKey: K_KEY_COLUMN_RANK,
      fixed: true,
      label: '',
      width: 70
    },
    {
      dataKey: K_KEY_COLUMN_DESCRIPTION,
      flexGrow: 4,
      label: '',
      width: 50
    },
    {
      dataKey: K_KEY_COLUMN_PHONE,
      flexGrow: 1,
      label: '',
      width: 50
    }
];

export {columns};


function showBalloon(rowData, rowIndex, e) {
  // console.log('rowIndex', rowIndex);
  const addressId = rowData.get('addresses').get(0).get('id');
  statisticsActions.setStatistics('c', 'click', [rowData.get('user_id')]);
  if (catalogDataStore.getActiveAddressId() === addressId) {
    catalogDataActionsNew.rowAddressActive(null, false);
  } else {
    catalogDataActionsNew.rowAddressActive(rowData.get('addresses').get(0).get('id'), true);
  }
}

function renderPartColumn(cellDataKey, rowData, rowIndex) {
  statisticsActions.setStatistics('c', 'show', [rowData.get('user_id')]);
  return (
    <div className='ta-C va-M w50px p0-10' onClick={showBalloon.bind(null, rowData, rowIndex)}>
      <i className={cx((rowData.get('filial_type_id') === 1) ? 'icon_placemark-ap' : 'icon_placemark-as')}></i>
      <div>
        <span className={cx('fs12 bB1d', (rowData.get('filial_type_id') === 1) ? 'c-deep-purple-500' : 'c-yellow-800')}>
          {rowData.get('addresses').first().get('region_number')}
        </span>
      </div>
    </div>
  );
}

function renderDescriptionColumn(cellDataKey, rowData, rowIndex) {
  return (
    <div className='va-M p10-0' onClick={showBalloon.bind(null, rowData, rowIndex)}>
      <div className='bR1s bc-grey-300 pR15'>
        <div className='entire-width mB15 flex-ai-c'>
          <Link
            href={'/company/'+rowData.get('user_id')+'/'+regionStore.get_region_current().get('translit_name')}
            className={cx('fs16 fw-b td-u cur-p w40pr mw200px c-grey-700')}
            onClick={() => {
              return statisticsActions.setStatistics('c', 'click', [rowData.get('user_id')])}
            }
          >
          { rowData.get('company_name').trim()}
          </Link>
          <Link
            href={'/company/'+rowData.get('user_id')+'/'+regionStore.get_region_current().get('translit_name')}
            className='c-grey-700 fs11 td-u'
            onClick={statisticsActions.setStatistics.bind(null, 'c', 'click', [rowData.get('user_id')])}
          >Отзывы:
            <span className='c-gr'> +{rowData.get('recommended').get('plus')} </span>/
            <span className='c-r'> -{rowData.get('recommended').get('minus')}</span>
          </Link>
          <span><Link href={`http://www.${rowData.get('site')}`} target='_blank' className='td-u fs12 c-deep-purple-600 w150px d-ib ta-R ellipsis'>{rowData.get('site')}</Link></span>
        </div>
        <div className='fs12'>
          <div className='c-grey-600 m5-0'>Описание компании:{/* info {rowData.get('sort')} {rowData.get('addresses').get(0).get('coordinates').toString()} */}</div>
          <span className='Mh40px d-ib o-h lh1-1'>{rowData.get('description')}</span>
        </div>
      </div>
    </div>
  );
}

function renderPhoneColumn(cellDataKey, rowData, rowIndex) {
  // вот жеж синтаксис es7 :-)
  return (
    <CatalogRowShowPhone {...{cellDataKey, rowData, rowIndex}} />
  );
}

export function getRowClassNameAt(i, isHovered, isFirstInvisibleRow) {
  const borderTopClass = isFirstInvisibleRow ? K_ROW_CLASS_NAME_BORDER_LINE : '';

  if (isHovered) {
    return borderTopClass + ' ' + (i % 2 === 0 ? K_ROW_CLASS_NAME_EVEN_HOVERED : K_ROW_CLASS_NAME_ODD_HOVERED);
  }

  return borderTopClass + ' ' + (i % 2 === 0 ? K_ROW_CLASS_NAME_EVEN : K_ROW_CLASS_NAME_ODD);
}

export function cellRenderer(cellDataKey, rowData, rowIndex) {
  switch (cellDataKey) {
    case K_KEY_COLUMN_RANK:
      return renderPartColumn(cellDataKey, rowData, rowIndex);
    case K_KEY_COLUMN_DESCRIPTION:
      return renderDescriptionColumn(cellDataKey, rowData, rowIndex);
    case K_KEY_COLUMN_PHONE:
      return renderPhoneColumn(cellDataKey, rowData, rowIndex);
    default:
      return (
        <div>{rowData ? 'Привет мир' : ''}</div>
      );
  }
}

