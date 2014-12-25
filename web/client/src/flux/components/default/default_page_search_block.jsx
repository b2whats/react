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
    description: PropTypes.string.isRequired
  },

  mixins: [PureRenderMixin],

  render () {
    return (
      <div className={this.props.className}>
          <h2 className="default-page-search-block-header">
            <span className="text-free-icon">{this.props.header}</span>
          </h2>
          <div className="default-page-search-block-content">
            <table className="default-page-search-block-width">            
              <tr className="default-page-search-block-width stylized-input text_btn">
                  <td className="default-page-search-block-width">
                    {this.props.children}
                  </td>
                  <td><button>Найти</button></td>
              </tr>
            </table>
          </div>

          <div className="big-search-block__hint">
              <span className="default-page-forexample">Например:</span>
              <a href="#">{this.props.sample}</a>
          </div>
          <div className="big-search-block__description">
            {this.props.description}
          </div>
      </div>
    );
  }
});

module.exports = DefaultPageSearchBlock;
