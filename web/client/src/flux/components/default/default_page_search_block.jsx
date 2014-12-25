'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var DefaultPageSearchBlock = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    console.log(this.props.className);
    return (
      <div className={this.props.className}>
          <h2 className="default-page-search-block-header"><span className="text-free-icon">Поиск автозапчастей</span></h2>
          <div className="default-page-search-block-content">
            <table className="default-page-search-block-width">            
              <tr className="default-page-search-block-width stylized-input text_btn">
                  <td className="default-page-search-block-width">
                    <input className="default-page-search-block-width" type="text" placeholder="Введите название, производителя или код*"/>
                    </td>
                  <td><button>Найти</button></td>
              </tr>
            </table>
          </div>

          <div className="big-search-block__hint">
              Например:
              <a href="#">стойка стабилизатора bmw x5</a>
          </div>
          <div className="big-search-block__description">
              *Начните вводить в строку название или производителя детали и марку, модель своего автомобиля и выберите из нескольких вариантов поискового запроса.
          </div>
      </div>
    );
  }
});

module.exports = DefaultPageSearchBlock;
