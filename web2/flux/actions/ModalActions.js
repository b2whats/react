import mainDispatcher from 'dispatchers/main_dispatcher.js';
import eventNames from 'shared_constants/event_names.js';
import resource from 'utils/resource.js';
import actionExportHelper from 'utils/action_export_helper.js';

const actions = [
  ['openModal', eventNames.kON_MODAL_SHOW],
  ['closeModal', eventNames.kON_MODAL_HIDE]
];

export default Object.assign({}, module.exports, actionExportHelper(actions));

