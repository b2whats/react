const React = require('react/addons');
const PropTypes = React.PropTypes;

const PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
const Link = require('components/link.jsx');
const {Table, Column} = require('fixed-data-table-ice');
/* jshint ignore:end */


const IceFixedTableHolder = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    cellRenderer: PropTypes.func.isRequired,
    columns: PropTypes.array.isRequired
  },

  render() {
    const {cellRenderer, ...other} = this.props;
    return (
      <Table
        {...other}
        >
        {this.props.columns.map((c, index) => (<Column key={index} cellRenderer={cellRenderer} {...c} />))}
      </Table>
    );
  }
});

module.exports = IceFixedTableHolder;
