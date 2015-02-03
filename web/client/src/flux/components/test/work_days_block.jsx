'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;

var kWORK_HOURS_FROM = ['00:00','02:00','04:00','06:00','08:00','09:00', '10:00' , '11:00', '12:00'];
var kWORK_HOURS_TO = ['14:00','16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];

var WorkDaysBlock = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onHolidayChange: PropTypes.func.isRequired,
    onFromChange: PropTypes.func.isRequired,
    onToChange: PropTypes.func.isRequired,
  },

  on_from_changed(e) {
    this.props.onFromChange(e.target.value);
  },

  on_to_changed(e) {
    this.props.onToChange(e.target.value);
  },

  on_checkbox_changed(e) {
    this.props.onHolidayChange(e.target.checked)
  },

  render () {
    var options_from = _.map(kWORK_HOURS_FROM, (value, index) => <option key={index} value={index}>{value}</option>);
    var options_to = _.map(kWORK_HOURS_TO, (value, index) => <option key={index} value={index}>{value}</option>)

    var index_from = _.indexOf(kWORK_HOURS_FROM, _.find(kWORK_HOURS_FROM, v => v===this.props.from));

    index_from = (index_from<0) ? 6 : index_from;

    var index_to = _.indexOf(kWORK_HOURS_TO, _.find(kWORK_HOURS_TO, v => v==this.props.to));
    
    index_to = (index_to<0) ? 6 : index_to;

    return (
    <div className={this.props.className}>
      <div className="width50p displ-ib">
        {this.props.title}
      </div>
      <div className="width50p displ-ib txt-al-middle">
        
        <div style={ {display: !this.props.is_holiday ? 'inline-block' : 'none' } } className="displ-ib txt-al-middle">
          <div className="displ-ib select-filial-modal-select-holder">
            <select onChange={this.on_from_changed} value={index_from} className="select-filial-modal-select">
              {options_from}
            </select>
          </div>
          <div className="displ-ib">-</div>
          <div className="displ-ib select-filial-modal-select-holder">
            <select onChange={this.on_to_changed} value={index_to} className="select-filial-modal-select">
              {options_to}
            </select>
          </div>
        </div>
        <div style={ {display: this.props.is_holiday ? 'inline-block' : 'none' } } className="displ-ib txt-al-middle select-filial-modal-is-holiday">
          выходной
        </div>

        {/*переделать на лабелы*/}
        <div className="displ-ib"><input onChange={this.on_checkbox_changed} checked={this.props.is_holiday} type="checkbox" /></div>
      </div>
    </div>
    );
  }
});

module.exports = WorkDaysBlock;

