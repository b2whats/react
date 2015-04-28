'use strict';
import React, {PropTypes, Component} from 'react/addons';
import keyOf from 'utils/keyof.js';

const kKEY_COLUMN_RANK = keyOf({kKEY_COLUMN_RANK: null});
const kKEY_COLUMN_DESCRIPTION = keyOf({kKEY_COLUMN_DESCRIPTION: null});
const kKEY_COLUMN_PHONE = keyOf({kKEY_COLUMN_PHONE: null});

//DATA DEFINITION
const columns = [
    {
      dataKey: kKEY_COLUMN_RANK,
      fixed: true,
      label: "",
      width: 50,
    },
    {
      dataKey: kKEY_COLUMN_DESCRIPTION,
      flexGrow: 1,
      label: "",
      width: 50,
    },
    {
      dataKey: kKEY_COLUMN_PHONE,
      flexGrow: 1,
      label: "",
      width: 50,
    },
];

export {columns};


function renderPartColumn(cellDataKey, rowData) {

}

function renderDescriptionColumn(cellDataKey, rowData) {

}

function renderPhoneColumn(cellDataKey, rowData) {

}

export function cellRenderer(cellDataKey, rowData, action) {
  return (
    <div>{rowData ? 'Привет мир' : ''}</div>
  );
}

