'use strict';

var React = require('react/addons');
var auth_actions = require('actions/auth_actions.js');
window.React = React; //for devtools

React.initializeTouchEvents(true); //для тач ивентов

require('third_party/console-polyfill.js');

var IceMain = require('./components/main.jsx');

var routes = require('./routes.js');
require('./utils/router.js')(routes); //инициализация роутера

console.log('dfdfdf');  

auth_actions.check_auth()
.then(() => 
  
  React.render(
      <IceMain/>, //ice_main(null)
      document.getElementById('react_main')
  )
)
.catch(e => {
  console.error(e.stack);
  throw e;
});
