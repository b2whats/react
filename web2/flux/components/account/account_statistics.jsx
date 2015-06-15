'use strict';

//var _ = require('underscore');
var React = require('react/addons');
//var PropTypes = React.PropTypes;
var immutable = require('immutable');
var PureRenderMixin = React.addons.PureRenderMixin;

var Emitter = require('utils/emitter.js');
var merge = require('utils/merge.js');
var event_names = require('shared_constants/event_names.js');

/* jshint ignore:start */
var Link = require('components/link.jsx');

var ChartWithControl = require('components/controls/charts/chart_with_control.jsx');
var ChartMarkerTemplateDefault = require('components/controls/charts/chart_marker_template.jsx');
var tmp_plot_data_ = require('components/test/tmp_plot_data.js');

/* jshint ignore:end */
var immutable = require('immutable');
var statisticsActions = require('actions/admin/statistics_actions.js');
var statisticsStore = require('stores/admin/statistics_store.js');

var ButtonGroup = require('components/forms_element/button_group.jsx');

var rafBatchStateUpdateMixinCreate = require('components/mixins/raf_state_update.js');
var RafBatchStateUpdateMixin = rafBatchStateUpdateMixinCreate(() => ({
    statistics: statisticsStore.getStatistics(),
    currentService: statisticsStore.getCurrentService(),
  }),
  statisticsStore);

var Table = require('./statisticsTable/table.jsx');



var AccountStatistics = React.createClass({
  mixins: [PureRenderMixin,RafBatchStateUpdateMixin],
  updateFormElement: function(e) {
    statisticsActions.update_form(e);
  },

  render() {
    return (
      <div>
        <h3 className="fs20 fw-n m0">Выберите раздел для отображения статистики:</h3>
        <ButtonGroup select_element_value={this.state.currentService} onChange={this.updateFormElement} className="m20-0">
          <button className='btn-bg-group ' value='ap'>Поиск автозапчастей</button>
          <button className='btn-bg-group ' value='as'>Консультация мастера</button>
          <button className='btn-bg-group ' value='c'>Каталог компаний</button>
        </ButtonGroup>
        <div style={{paddingLeft: '50px', paddingRight: '50px'}} className="account-statistics">
          {this.state.statistics && this.state.statistics.get(this.state.currentService) && this.state.statistics.get(this.state.currentService).get('click') &&
          <div>
          <h2 className="ta-C fs20 mB10">Клики</h2>
          <ChartWithControl marker_template={ChartMarkerTemplateDefault} curvature={3} plots_data={this.state.statistics && this.state.statistics.get(this.state.currentService) && this.state.statistics.get(this.state.currentService).get('click')}/>
          </div>
          }
          {this.state.statistics && this.state.statistics.get(this.state.currentService) && this.state.statistics.get(this.state.currentService).get('show')  &&
          <div className="mT50">
          <h2 className="ta-C fs20 m10-0">Показы</h2>
          <ChartWithControl marker_template={ChartMarkerTemplateDefault} curvature={3} plots_data={this.state.statistics && this.state.statistics.get(this.state.currentService) && this.state.statistics.get(this.state.currentService).get('show')}/>
          </div>
          }
        </div>

        <Table />
      </div>
    );
  }
});

module.exports = AccountStatistics;
