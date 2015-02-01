'use strict';
var React = require('react/addons');


var EditableForms = React.createClass({
    displayName: 'EditableForms',
    shouldComponentUpdate: function(nextProps){
        return (
            (nextProps.text !== this.props.text && nextProps.edit === this.props.edit) ||
            (nextProps.text === this.props.text && nextProps.edit !== this.props.edit)
        );
    },
    getDefaultProps: function () {
        return {
            type: 'input',
            edit: false,
            name: 'forms[]',
            text: ''
        };
    },
    update: function(e) {
        this.props.onChange(e.target.value)
    },
    render () {
        console.log('ed_f');
        var self = this;
        var classes = React.addons.classSet({
            'editable' : this.props.edit == true
        });
        var elementForm = (function(type) {
            switch(type) {
                case 'input':
                    return (
                        <input ref='form' disabled={!self.props.edit} className={classes} type='text' onChange={self.update} value={self.props.text}/>
                    );
                    break;
                case 'textarea':
                    return (
                        <textarea ref='form' disabled={!self.props.edit} className={classes} onChange={self.update} value={self.props.text} />
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