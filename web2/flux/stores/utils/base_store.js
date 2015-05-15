import mainDispatcherCreate from 'dispatchers/main_dispatcher.js';
import Emitter from 'utils/emitter.js';
import initState from 'utils/init_state.js';

import eventNames from 'shared_constants/event_names.js';
import sc from 'shared_constants';

export default class BaseStore extends Emitter {
  dispatcher = mainDispatcherCreate.create_proxy();

  constructor(fluxInstance) {
    super();
    this.fluxInstance_ = fluxInstance;
    this.disposables = [];
    this.fireChangeEvent = this.fire.bind(this, eventNames.kON_CHANGE);
    this.$assert_info = this.dispatcher.get_assert_info();
  }

  register(eventName, handler, priority) {
    const dispose = this.dispatcher
      .on(eventName, handler.bind(this), priority || sc.kDEFAULT_STORE_PRIORITY);

    this.disposables.push(dispose);
  }

  initialState(state) {
    if (!this.constructor.name) {
      throw new Error('constructor name undefined');
    }

    const atomName = this.constructor.name + '__' + this.constructor.displayName + '__' + (this.fluxInstance_ && this.fluxInstance_.id || '');
    //console.log(atomName, this.constructor.name, this.constructor.displayName, this.constructor.prototype);

    return initState(atomName, state);
  }


  dispose() {
    if (this.disposables) {
      this.disposables.forEach(dispose => dispose());
    }
    this.disposables = null;
  }
}
