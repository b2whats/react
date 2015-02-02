var React = require('react/addons');
var PropTypes = React.PropTypes;

var _ = require('underscore');
var joinClasses = require('utils/join_classes.js');


var ButtonGroup = React.createClass({
    displayName: 'ButtonGroup',
    propTypes: {
        onChange: PropTypes.func.isRequired,
    },

    getDefaultProps: () => ({
        select_element_value: null
    }),

    onChange(v) {
        return () => this.props.onChange(v);
    },

    render: function () {
        var children = this.props.children.map(function(item, i) {
            var classes = React.addons.classSet({
                'selected' : this.props.select_element_value == item.props.value
            });
            return React.addons.cloneWithProps(item, {
                onClick: this.onChange(item.props.value), //_.bind( this.props.onChange, null, item.props.value),
                key: i,
                className: classes
            });
        }, this);
        return (
            <div className={joinClasses('btn-group', this.props.className)}>
                {children}
            </div>
        );
    }
});

module.exports = ButtonGroup;