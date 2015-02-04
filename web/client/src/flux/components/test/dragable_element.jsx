'use strict';
var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx = React.addons.classSet;

var PureRenderMixin = React.addons.PureRenderMixin;


var DragableElement = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    
  },

  getInitialState() {
    return {
      value: this.props.value || this.props.defaultValue || 0
    };
  },

  componentWillMount() {
    this.relative_node = null;
    this.relative_rect_width = null;
    this.mouse_start = null;
    this.current_pos = null;
  },

  componentDidMount() {
    var node = this.refs.draggable.getDOMNode();
    var parent = node.parentNode;
    
    while(parent && window.getComputedStyle(parent).position!=='relative') {
      parent = parent.parentNode;
    }

    this.relative_node = parent;

    document.addEventListener('mousemove', this.on_document_mousemove);
    document.addEventListener('mouseup', this.on_document_mouseup);
  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.on_document_mousemove);
    document.removeEventListener('mouseup', this.on_document_mouseup);
  },

  on_element_mouse_down(e) {
    this.mouse_start = e.clientX;
    

    this.relative_rect_width = this.relative_node.getBoundingClientRect().width;
    this.current_pos = this.relative_rect_width*(this.props.value || this.state.value) / 100  ;
  },

  on_document_mousemove (e) {
    if(this.mouse_start===null) return;
    var delta_x = e.clientX - this.mouse_start;
    var new_pos = this.current_pos + delta_x;
    new_pos = 100 * Math.min( Math.max(0, new_pos), this.relative_rect_width) / this.relative_rect_width;

    if(this.props.value!==undefined) {
      this.props.onChange(new_pos);
    } else {
      this.replaceState({value: new_pos});

      if(this.props.onChange) {
        this.props.onChange(new_pos);
      }
    }
  },

  on_document_mouseup (e) {
    if(this.mouse_start===null) return;

    this.current_pos = null;
    this.mouse_start = null;
  },

  render () {
    var value = this.props.value!==undefined ? this.props.value : this.state.value;

    return (
      <div 
        ref="draggable" 
        onMouseDown={this.on_element_mouse_down} 
        style={ {position:'absolute', left: `${value}%`} }
        className={this.props.className}>
        
        {this.props.children}  
      
      </div>
    );
  }
});

module.exports = DragableElement;

