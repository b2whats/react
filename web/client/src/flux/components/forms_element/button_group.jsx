var React = require('react/addons');
var joinClasses = require('utils/join_classes.js');
var ButtonGroup = React.createClass({
    displayName: 'ButtonGroup',
    getDefaultProps: () => ({
        select_element_value: null,
        onChange: ()=> ''
    }),
    render: function () {
        var children = this.props.children.map(function(item, i) {
            var classes = React.addons.classSet({
                'selected' : this.props.select_element_value == item.props.value
            });

            this.props.onChange(item.props.value);
            return React.addons.cloneWithProps(item, {
                onClick: this.props.onChange(item.props.value),
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