'use strict';

var React = require('react/addons');

window.React = React; //for devtools

React.initializeTouchEvents(true); //для тач ивентов

require('third_party/console-polyfill.js');

var IceMain = require('./components/main.jsx');

React.render(
    <IceMain/>, //ice_main(null)
    document.getElementById('react_main')
);



//document.addEventListener('click', () => console.log('hello world ice wow'));

