
export default function view(propNames) {
  return (target, key, descriptor) => {
    let prevStoreState = {};
    let viewState = null;
    let calcView = descriptor.value;
    if (typeof calcView !== 'function') {
      throw new Error(`@autobind decorator can only be applied to methods not: ${typeof calcView}`);
    }

    return {
      configurable: true,
      get() {
        let calcViewBinded = calcView.bind(this);

        let checkPropsAndCallFn = (...args) => {
          const storeState = this.state;

          if (propNames.some(propName => storeState[propName]!==prevStoreState[propName])) {
            viewState = calcViewBinded(storeState, ...args);

            prevStoreState = propNames.reduce((memo, propName) => {
              memo[propName] = storeState[propName];
              return memo;
            }, {});
          }

          return viewState;
        };

        Object.defineProperty(this, key, {
          value: checkPropsAndCallFn,
          configurable: true,
          writable: true
        });

        return checkPropsAndCallFn;
      }
    };
  };
}
