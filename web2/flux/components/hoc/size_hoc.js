var React = require('react/addons');


var SizeHoc = (Component) => {
  const SizeHocComponent = React.createClass({        
    componentDidMount() {
      this._update();
      window.addEventListener('resize', this._onResize, false);
    },

    _onResize() {
      clearTimeout(this._updateTimer);
      this._updateTimer = setTimeout(this._update, 16);
    },

    _update() {
      const node = this.component.getDOMNode();
      if (this.isMounted()) {
        this.setState({
          width: node.offsetWidth,
          height: node.offsetHeight
        });
      }
    },

    render() {
      return <Component ref={v => this.component = v} {...this.props} {...this.state} />
    }
  });
  return SizeHocComponent;
};


module.exports = SizeHoc;
