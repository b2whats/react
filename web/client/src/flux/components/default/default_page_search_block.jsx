'use strict';

var React = require('react/addons');
var PropTypes = React.PropTypes;

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var DefaultPageSearchBlock = React.createClass({
  propTypes: {
    className: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    sample: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    sample_action: PropTypes.func.isRequired
  },
  getDefaultProps() {
    return {
      onSearch: function() {},
    }
  },
  mixins: [PureRenderMixin],

  sample_click(e) {
    this.props.sample_action(this.props.sample);
    e.preventDefault();
    e.stopPropagation();
  },

  render () {

    return (
      <div className={this.props.className}>
          <h2 className="default-page-search-block-header">
            <span className="text-free-icon">{this.props.header}</span>
          </h2>
          
          <div className="default-page-search-block-content">
            <div className="fs11 p5-0">
            {this.props.description}
            </div>
            <table className="default-page-search-block-width">            
              <tr className="default-page-search-block-width stylized-input text_btn">
                  <td className="default-page-search-block-width">
                    {this.props.children}
                  </td>
                  <td><button onClick={this.props.onSearch}>Найти</button></td>
              </tr>
            </table>
          </div>

          <div className="big-search-block__hint mB50">
              <span className="default-page-forexample">Например:</span>
              <a onClick={this.sample_click} href="#">{this.props.sample}</a>
          </div>

      </div>
    );
  }
});

module.exports = DefaultPageSearchBlock;
