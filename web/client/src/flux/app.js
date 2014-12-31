/** @jsx React.DOM */
'use strict';

var React = require('react/addons');

window.React = React; //for devtools

React.initializeTouchEvents(true); //для тач ивентов

require('third_party/console-polyfill.js');

var IceMain = require('./components/main.jsx');

/* jshint ignore:start */
React.render(
    <IceMain/>, //ice_main(null)
    document.getElementById('react_main')
);
/* jshint ignore:end */



console.log('j', Event); 

window.is_set_reload || window.addEventListener('fb-flo-reload', function(ev) {
    window.React.unmountComponentAtNode(document.getElementById('react_main'));
    window.is_set_reload = true;
    eval(ev.data.contents);
});