import React, { Component } from 'react';

import _ from 'underscore';
import raf from 'utils/raf.js';
import eventNames from 'shared_constants/event_names.js';
import shallowEqual from 'react/lib/shallowEqual.js';

let __internalCounter__ = 0;

export default function rafStateUpdate(getState, ...stores) {
  return DecoratedComponent => class RafStateUpdateContainer extends Component {

    __internal__display_name__ = (DecoratedComponent.displayName || DecoratedComponent.name || 'Component') + '___' + __internalCounter__++;

    constructor(props) {
      super(props);
      this.state = getState(props);

      this.eventDisablers = _.map(stores, store => store.on(eventNames.kON_CHANGE, this._onChangeHandler));
    }

    _onChangeHandler = () => {
      raf(() => {
        const state = getState();
        if (this.eventDisablers!==null) {
          this.setState(state);
        }
      }, null, this.__internal__display_name__);
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState);
    }

    componentWillUnmount() {
      _.each(this.eventDisablers, (disabler) => {
        disabler();
      }, this);
      this.eventDisablers = null;
    }

    render() {
      return <DecoratedComponent {...this.props} {...this.state} />;
    }
  };
}


export function stateUpdate(getState, ...stores) {
  return DecoratedComponent => class RafStateUpdateContainer extends Component {

    __internal__display_name__ = (DecoratedComponent.displayName || DecoratedComponent.name || 'Component') + '___' + __internalCounter__++;

    constructor(props) {
      super(props);
      this.state = getState(props);

      this.eventDisablers = _.map(stores, store => store.on(eventNames.kON_CHANGE, this._onChangeHandler));
    }

    _onChangeHandler = () => {
      const state = getState();
      if (this.eventDisablers!==null) {
        this.setState(state);
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowEqual(this.props, nextProps) ||
        !shallowEqual(this.state, nextState);
    }

    componentWillUnmount() {
      _.each(this.eventDisablers, (disabler) => {
        disabler();
      }, this);
      this.eventDisablers = null;
    }

    render() {
      return <DecoratedComponent {...this.props} {...this.state} />;
    }
  };
}
