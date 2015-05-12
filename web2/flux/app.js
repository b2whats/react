import React, {Component, PropTypes} from 'react/addons';
import AuthActions from 'actions/auth_actions.js';

window.React = React; // for devtools
React.initializeTouchEvents(true); // для тач ивентов


import IceMain from 'components/main.jsx';
import routes from './routes.js';
require('./utils/router.js')(routes); // инициализация роутера

AuthActions.check_auth()
.then(() =>
  React.render(
    <IceMain/>, // ice_main(null)
    document.getElementById('react_main')
  )
)
.catch(e => {
  console.error(e.stack);
  throw e;
});
