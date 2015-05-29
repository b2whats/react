import mainDispatcher from 'dispatchers/main_dispatcher.js';
import eventNames from 'shared_constants/event_names.js';
import apiRefs from 'shared_constants/api_refs.js';
import resource from 'utils/resource.js';
import actionExportHelper from 'utils/action_export_helper.js';
import validator from 'revalidator';

const actions_ = [];


module.exports.setStatistics = (service, type, ids) => {
  resource(apiRefs.STATISTICS)
    .post({requestType: 'set', statisticsType: type, statisticsService: service, companyId: ids})
    .then(response => {
      console.log(response);
    });
};

module.exports = Object.assign({}, module.exports, actionExportHelper(actions_));

