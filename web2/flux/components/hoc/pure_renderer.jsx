'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

//обернуть render метод переданный через props дабы если не было изменений не вызывать лишний раз
var PureRenderer = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    var {render, ...other} = this.props;
    return render(other);
  }
});

module.exports = PureRenderer;
