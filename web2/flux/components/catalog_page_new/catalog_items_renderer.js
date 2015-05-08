import React, {PropTypes, Component} from 'react/addons';
import keyOf from 'utils/keyof.js';
import cx from 'classnames';
import Link from 'components/link.jsx';
import regionStore from 'stores/region_store.js';
import catalogDataActions from 'actions/catalog_data_actions.js';

const K_KEY_COLUMN_RANK = keyOf({K_KEY_COLUMN_RANK: null});
const K_KEY_COLUMN_DESCRIPTION = keyOf({K_KEY_COLUMN_DESCRIPTION: null});
const K_KEY_COLUMN_PHONE = keyOf({K_KEY_COLUMN_PHONE: null});

const K_ROW_CLASS_NAME_EVEN = 'catalog-page-table-new-row-even';
const K_ROW_CLASS_NAME_ODD = 'catalog-page-table-new-row-odd';

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

function renderPartColumn(cellDataKey, rowData) {
  return (
    <div className='ta-C va-M w50px p0-10'>
      <i className={cx((rowData.get('filial_type_id') === 1) ? 'icon_placemark-ap' : 'icon_placemark-as')}></i>
      <div>
        <span className={cx('fs12 bB1d', (rowData.get('filial_type_id') === 1) ? 'c-deep-purple-500' : 'c-yellow-800')}>
          {rowData.get('rank')}
        </span>
      </div>
    </div>
  );
}

function renderDescriptionColumn(cellDataKey, rowData) {
  return (
    <div className='va-M p10-0'>
      <div className='bR1s bc-grey-300 pR15'>
        <div className='entire-width mB15 flex-ai-c'>
          <Link href={'/company/'+rowData.get('user_id')+'/'+regionStore.get_region_current().get('translit_name')}
            className={cx('fs16 fw-b td-u cur-p w40pr mw200px c-grey-700')}>
          { rowData.get('company_name').trim()}
          </Link>
          <Link href={'/company/'+rowData.get('user_id')+'/'+regionStore.get_region_current().get('translit_name')} className='c-grey-700 fs11 td-u'>Отзывы:
            <span className='c-gr'> +{rowData.get('recommended').get('plus')} </span>/
            <span className='c-r'> -{rowData.get('recommended').get('minus')}</span>
          </Link>
          <span><Link href="" target='_blank' className='td-u fs12 c-deep-purple-600 w150px d-ib ta-R ellipsis'>{rowData.get('site')}</Link></span>
        </div>
        <div className='fs12'>
          <div className='c-grey-600 m5-0'>Описание компании: info {rowData.get('sort')} {rowData.get('addresses').get(0).get('coordinates').toString()}</div>
          <span className='Mh40px d-ib o-h'>{rowData.get('description')}</span>
        </div>
      </div>
    </div>
  );
}

function renderPhoneColumn(cellDataKey, rowData) {
  const showPhone = false;
  const mainPhone = rowData.get('main_phone'); // rowData.get('main_marker').get('main_phone')

  return (
    <div className='ta-C va-M'>
      <div style={ { display: showPhone ? 'block': 'none' } }
        className="ta-C fs20">
        <span className='fs14'>{!!mainPhone && mainPhone.substr(0, 7)}</span>
      {!!mainPhone && mainPhone.substr(7)}
      </div>
      <button onClick={ () => catalogDataActions.catalog_show_phone(rowData.get('main_marker').get('id'))}
        style={ { display: showPhone ? 'none' : 'inline-block' } }
        className="p8 br2 grad-w b0 btn-shad-b ta-C">
        <i className="flaticon-phone c-deep-purple-500 fs16 mR5"></i>
        <span className=''>Показать телефон</span>
      </button>
    </div>
  );
}

export function getRowClassNameAt(i) {
  return i % 2 === 0 ? K_ROW_CLASS_NAME_EVEN : K_ROW_CLASS_NAME_ODD;
}

export function cellRenderer(cellDataKey, rowData, tableAction) {
  switch (cellDataKey) {
    case K_KEY_COLUMN_RANK:
      return renderPartColumn(cellDataKey, rowData, tableAction);
    case K_KEY_COLUMN_DESCRIPTION:
      return renderDescriptionColumn(cellDataKey, rowData, tableAction);
    case K_KEY_COLUMN_PHONE:
      return renderPhoneColumn(cellDataKey, rowData, tableAction);
    default:
      return (
        <div>{rowData ? 'Привет мир' : ''}</div>
      );
  }
}

