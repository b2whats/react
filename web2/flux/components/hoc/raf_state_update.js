import React, { Component } from 'react';

var _ = require('underscore');
var raf = require('utils/raf.js');
var event_names = require('shared_constants/event_names.js');

var shallowEqual = require('react/lib/shallowEqual.js');


var __internal__counter__ = 0;

export default function rafStateUpdate(get_state, ...stores) {
  
  return DecoratedComponent => class RafStateUpdateContainer extends Component {
    
    __internal__display_name__ = DecoratedComponent.prototype.constructor.name + '___' + __internal__counter__++;

    constructor(props) {
      super(props);
      this.state = get_state(props);
      
      this.event_disablers = _.map(stores, store => store.on(event_names.kON_CHANGE, this._onChangeHandler));
    }

    _onChangeHandler = () => {
      raf(() => {
        var state = get_state();        
        if(this.event_disablers!==null) {
          this.setState(state);
        }
      }, null, this.__internal__display_name__);
    }
    
    shouldComponentUpdate (nextProps, nextState) {
      return !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState);
    }

    componentWillUnmount() {
      _.each(this.event_disablers, function(disabler) {
        disabler();
      }, this);
      this.event_disablers = null;
    }    

    render() {
      return <DecoratedComponent {...this.props} {...this.state} />;
    }
  }
}
