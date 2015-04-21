'use strict';
var React = require('react/addons');
var MaskedInput = require('components/forms_element/masked_input.jsx');
var cx = require('classnames');


var EditableForms = React.createClass({
    displayName: 'EditableForms',
    getInitialState: function () {
      return {text: this.props.text}
    },
    shouldComponentUpdate: function(nextProps, nextState){

        return (
            (nextProps.text !== this.props.text && nextProps.edit === this.props.edit) ||
            (nextProps.text === this.props.text && nextProps.edit !== this.props.edit) ||
            (nextState.text !== this.state.text && nextProps.edit == this.props.edit) ||
            (nextState.text === this.state.text && nextProps.edit !== this.props.edit)
        );
    },
  componentWillReceiveProps: function (newProps) {
    // only accept the latest value from props

      this.setState({text: newProps.text})

  },
    getDefaultProps: function () {
      return {
        type        : 'input',
        edit        : false,
        name        : 'forms[]',
        text        : '',
        placeholder : ''
      };
    },
    update: function(e) {
      this.setState({text: e.target.value});
      this.props.onChange(e.target.value);
    },
    render () {

        var self = this;
        var classes = cx({'editable' : self.props.edit == true,}, self.props.className);
  var elementForm = (function(type) {
            switch(type) {
                case 'input':
                    return (
                        <input disabled={!self.props.edit} placeholder={self.props.placeholder} className={classes} type='text' onChange={self.update} value={self.state.text}/>
                    );
                    break;
                case 'phone':
                    return (
                      <span>
                      { (self.props.edit) ?
                        <MaskedInput
                          disabled={!self.props.edit}
                          className={classes}
                          pattern={'+7({{999}}){{999}}-{{99}}-{{99}}'}
                          value={self.state.text}
                          onChange={self.update} />
                        :
                        <input disabled='true' placeholder={self.props.placeholder} className={classes} type='text' value={self.state.text}/>
                      }
                      </span>
                    );
                    break;
                case 'textarea':
                    return (
                        <textarea placeholder={self.props.placeholder} disabled={!self.props.edit} className={classes} onChange={self.update} value={self.state.text} />
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