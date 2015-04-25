'use strict';



module.exports.query_selector = function(selector, elt) {
  if(typeof document === 'undefined') return null; //на сервере

  if(elt === undefined || elt === null) {
    elt = document;
  }
  return elt.querySelector(selector);
};


module.exports.subscribe = function(elt, event, fn) {
  elt.addEventListener(event, fn, false);
};

module.exports.unsubscribe = function(elt, event, fn) {
  elt.removeEventListener(event, fn);
};

module.exports.subscribe_w_capture = function(elt, event, fn) {
  elt.addEventListener(event, fn, true);
};

module.exports.add_class = function(elt, class_name) {
  if(elt.className.indexOf(class_name)===-1) {
    elt.className+=' '+ class_name;
  }
};

module.exports.remove_class = function(elt, class_name) {
  if(elt.className.indexOf(class_name)!==-1) {
    var txt = elt.className.replace(' '+class_name, '');
    txt = elt.className.replace(class_name, '');
    elt.className = txt;
  }
};

module.exports.get_size = function(elt) {
  return { width:elt.offsetWidth, height: elt.offsetHeight};
};

module.exports.is_safari_with_retina = function() {
  if(typeof navigator === 'undefined') return false;

  var nagt = navigator.userAgent;
  return nagt.indexOf('OS X')!==-1 && nagt.indexOf('Safari')!==-1 && nagt.indexOf('Chrome')===-1 && window.devicePixelRatio > 1;
};

/*
var el = document.getElementById('ta_in'); 

if (typeof el.addEventListener != "undefined") {
    el.addEventListener("keyup", function(evt) {
        get_ml();
    }, false);
} else if (typeof el.attachEvent != "undefined") { //incase you support IE8
    el.attachEvent("onkeyup", function(evt) {
        get_ml();
    });
}
*/