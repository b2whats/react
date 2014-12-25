'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var DefaultPageSearchBlock = require('./default_page_search_block.jsx');
/* jshint ignore:end */

var SearchAutoPartsWrapper = require('components/search_wrappers/search_auto_parts_wrapper.jsx');



var DefaultPage = React.createClass({
  mixins: [PureRenderMixin],
  
  render () {
    return (
    <div className="default-page">
      <div className="default-page-abs">
        <div className="hfm-wrapper default-page-search-height">
          <div className="default-page-wrapper default-page-search-height">
            <div className="default-page-content big-search-block entire-width">
              <div className="default-page-logo big-logo"><span className="ap-color fl">Auto</span><span className="as-color fb">Giper</span></div>
              
              <DefaultPageSearchBlock className="big-search-block-block autoparts"
                header="ПОИСК АВТОЗАПЧАСТЕЙ"
                sample="стойка стабилизатора bmw x5"
                description="*Начните вводить в строку название или производителя детали и марку, модель своего автомобиля и выберите из нескольких вариантов поискового запроса.">
                  <SearchAutoPartsWrapper placeholder="Введите название, производителя или код*" />
              </DefaultPageSearchBlock>

              <DefaultPageSearchBlock className="big-search-block-block autoservices" 
                header="КОНСУЛЬТАЦИЯ МАСТЕРА"
                sample="mazda ремонт подвески"
                description="**Начните вводить в строку марку, модель своего автомобиля и название работ выберите из нескольких вариантов поискового запроса.">
                  <input className="default-page-search-block-width" type="text" placeholder="Введите марку автомобиля и название работ**"/>
              </DefaultPageSearchBlock>
            </div>
          </div>
        </div>      
      </div>
    </div>
    );
  }
});

module.exports = DefaultPage;
