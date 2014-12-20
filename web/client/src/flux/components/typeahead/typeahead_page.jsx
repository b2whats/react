'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

//var _ = require('underscore');

/* jshint ignore:start */

var ReactAutocomplete = require('react-autocomplete');
/* jshint ignore:end */

//var bin_actions = require('actions/bin_actions');

var TypeaheadPage = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    return (      
      <div className="tp-full-height-emul tp-hidden-overflow tp-relative">{/*сэмулирую body height:100% и overflow:hidden*/}
        <div className="tp-finders">
          <div className="tp-search">
            <div className="tp-search-panel">
              <h5 className="tp-search-header">ПОИСК АВТОЗАПЧАСТЕЙ</h5>
              <div className="tp-search-content">
                <ReactAutocomplete />
              </div>
              <div className="tp-search-footer">
                наберите блу блу для бла бла
              </div>
            </div>
          </div>
          <div className="tp-search">
            <div className="tp-search-panel">
              <h5 className="tp-search-header">КОНСУЛЬТАЦИЯ МАСТЕРА</h5>
              <div className="tp-search-content">
                <ReactAutocomplete />
              </div>
              <div className="tp-search-footer">
                наберите бла бла для бла бла
              </div>
            </div>
          </div>
        </div>
        
        <div className="tp-footer-emul tp-absolute">footer emulation</div>
      </div>
    )
  }
});

module.exports = TypeaheadPage;
