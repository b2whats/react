'use strict';
var React = require('react/addons');


var EditableForms = React.createClass({
    displayName: 'EditableForms',

    getDefaultProps: function () {
        return {
            type: 'input',
            edit: false,
            name: 'forms[]'
        };
    },
    update: function(e) {
        console.log(e.target.value);
        this.props.onChange(e.target.value)
    },
    render () {
        var self = this;
        var classes = React.addons.classSet({
            'editable' : this.props.edit == true
        });
        var elementForm = (function(type) {
            switch(type) {
                case 'input':
                    return (
                        <input disabled={!self.props.edit} className={classes} type='text' onChange={self.update} value={self.props.text}/>
                    );
                    break;
                case 'textarea':
                    return (
                        <textarea disabled={!self.props.edit} className={classes} onChange={self.update} value={self.props.text} />
                    );
                    break;
            }
        }) (this.props.type);
        return (
            <div className={this.props.className}>
                {elementForm}
            </div>
        )
    }
});

module.exports = EditableForms;