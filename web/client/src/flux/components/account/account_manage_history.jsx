'use strict';

var _ = require('underscore');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var rafBatchStateUpdateMixinCreate =require('mixins/raf_state_update.js');

var Link = require('components/link.jsx');
var Griddle = require('griddle-react');


var account_manage_store = require('stores/admin/account_manage_store.js');
var account_manage_actions = require('actions/admin/account_manage_actions.js');

var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({
    history: account_manage_store.get_history(),
}),
  account_manage_store);

var LinkComponent = React.createClass({
  deletePrice(val) {
    return () => {
      account_manage_actions.delete_price(val);
    }
  },
  render: function(){
    return <span className='cur-p' onClick={this.deletePrice(this.props.rowData.id)}>Удалить</span>
  }
});


var AccountManage = React.createClass({
  mixins: [PureRenderMixin, RafBatchStateUpdateMixin],

  render () {
    var columnMeta = [
      {
        "columnName"      : "id",
        "displayName": "ID",
        "order": 1,
        "cssClassName" : 'w50px'
      },
      {
        "columnName"      : "name",
        "displayName": "Имя файла",
        "order": 2,
      },
      {
        "columnName"      : "price_type",
        "displayName": "Тип прайс-листа",
        "order": 3
      },
      {
        "columnName"      : "used",
        "displayName": "Состояние товара",
        "order": 4,
      },
      {
        "columnName"      : "date",
        "displayName": "Дата загрузки",
        "order": 5,
      },
      {
        "columnName"      : "status",
        "displayName": "Статус",
        "order": 6,
      },
      {
        "columnName"      : "user_id",
        "visible": false
      },
      {
        "columnName"      : "path",
        "visible": false
      },
      {
        "columnName"      : "active",
        "visible": false
      },
      {
        "columnName"      : "info",
        "visible": false
      },
    ];
console.log(this.state.history.toJS());
    return (
      <div>
        <Griddle  columnMetadata={columnMeta} results={this.state.history.toJS()} showFilter={true}/>
      </div>
    );
  }
});

module.exports = AccountManage;
