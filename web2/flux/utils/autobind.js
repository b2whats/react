function autobind(target) {
  Object.getOwnPropertyNames(target.constructor.prototype)
    .filter(x => x.startsWith('on'))
    .map(x => target[x] = target[x].bind(target));
}

export default autobind;
