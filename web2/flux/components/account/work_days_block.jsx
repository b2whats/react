'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;

var kWORK_HOURS_FROM = [
	'00:00',
	'02:00',
	'04:00',
	'06:00',
	'08:00',
	'09:00',
	'10:00',
	'11:00',
	'12:00'
];
var kWORK_HOURS_TO = [
	'14:00',
	'16:00',
	'17:00',
	'18:00',
	'19:00',
	'20:00',
	'21:00',
	'22:00',
	'23:00',
	'24:00'
];

var WorkDaysBlock = React.createClass({
	mixins : [PureRenderMixin],

	propTypes : {
		onHolidayChange : PropTypes.func.isRequired,
		onFromChange    : PropTypes.func.isRequired,
		onToChange      : PropTypes.func.isRequired,
	},

	on_from_changed(e) {
		return this.props.onFromChange(e.target.value);
	},

	on_to_changed(e) {
		return this.props.onToChange(e.target.value)
	},

	on_checkbox_changed(e) {
		this.props.onHolidayChange(e.target.checked)
	},

	render() {
		var options_from = _.map(kWORK_HOURS_FROM, (value, index) => <option key={index} value={value}>{value}</option>);
		var options_to = _.map(kWORK_HOURS_TO, (value, index) => <option key={index} value={value}>{value}</option>)

		//var index_from = _.indexOf(kWORK_HOURS_FROM, _.find(kWORK_HOURS_FROM, v => v === this.props.from));

		//index_from = (index_from < 0) ? 6 : index_from;

		//var index_to = _.indexOf(kWORK_HOURS_TO, _.find(kWORK_HOURS_TO, v => v == this.props.to));

		//index_to = (index_to < 0) ? 6 : index_to;

		return (
			<tr className='h40px'>
				<td>{this.props.title}</td>
				<td>
					<div style={ {
						display : !this.props.is_holiday ?
							'inline-block' :
							'none'
					} } className="displ-ib txt-al-middle">
						<div className="d-ib">
							<select onChange={this.on_from_changed} value={this.props.from} className="select-filial-modal-select">
              {options_from}
							</select>
						</div>
						<div className="d-ib">-</div>
						<div className="d-ib">
							<select onChange={this.on_to_changed} value={this.props.to} className="select-filial-modal-select">
              {options_to}
							</select>
						</div>
					</div>
					<div style={ {
						display : this.props.is_holiday ?
							'inline-block' :
							'none'
					} } className="d-ib select-filial-modal-is-holiday">
						выходной
					</div>
				</td>
				<td>
					<input onChange={this.on_checkbox_changed} checked={this.props.is_holiday} type="checkbox" />
				</td>
			</tr>
		);
	}
});

module.exports = WorkDaysBlock;

