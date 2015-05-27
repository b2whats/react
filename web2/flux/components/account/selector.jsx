'use strict';

var _ = require('underscore');
var React = require('react/addons');
var PropTypes = React.PropTypes;

var cx        = require('classnames');

var PureRenderMixin = React.addons.PureRenderMixin;
var UniqueNameMixin = require('components/mixins/unique_name_mixin.jsx');

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */


function trace(v) {
  // console.log('SELECTOR', v);
  return v;
}

var Selector = React.createClass({
  /*
  propTypes: {
    className: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired
  },
  */
  mixins: [PureRenderMixin, UniqueNameMixin],

  getInitialState: function() {
    return {
      values: {} 
    };
  },

  on_change(key) {
    var v = {};
    v[key] = true;
    this.setState({values: v});
    
    if(this.props.onChange) {
      this.props.onChange();
    }
  },


  render () {
    var component_class = cx("selector", cx(this.props.className));
    var c_uid = this.getUniqueName();

    var Children = React.Children.map(this.props.children, (child, child_index) => {      
      var key  = child.key === undefined || child.key === null ? child_index : child.key;
      
      return (
        <div className={cx("selector-item", cx(child.props.classBlock))}>
          <div className={cx("selector-item-header", cx(child.props.classTitle))}>
          <label htmlFor={c_uid + '_' + key} className="label-radio">
            <input
              onChange={_.bind(this.on_change, null, key)}
              type="radio"
              name={c_uid}
              id={c_uid + '_' + key}
              checked={!!this.state.values[key]}
              className="radio m0-10"/>
            {child.props.title}
          </label>

          </div>
          
          <div className={cx(cx({'selector-item-body-invisible': !this.state.values[key]}), cx('selector-item-body'), cx(child.props.itemBodyClassName))}>
            {React.addons.cloneWithProps(child, { 
              key: key,               
            })}
          </div>
        </div>
      );
    });
    
    return (
      <div className={component_class}>
        {Children}
      </div>
    );
  }
});

module.exports = Selector;
