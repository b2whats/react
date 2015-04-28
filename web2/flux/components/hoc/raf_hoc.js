import React, { Component } from 'react';

export default function RafStateUpdate({ get_state, stores }) {
  return DecoratedComponent => class RafStateUpdateContainer extends Component {
    constructor(props) {
      super(props);
      this.state = get_state(props);
    }

    render() {
      return <DecoratedComponent {...this.props} {...this.state} />;
    }
  }
}
