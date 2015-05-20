'use strict';

var _ = require('underscore');
var q = Promise; //require('third_party/es6_promise.js');
var route_template = require('utils/route_template.js');
var text_utils = require('utils/text.js');


function http(method, url, object, timeout, reconnect_attempts, parent_resolve, parent_reject) {
  
  var was_timeout = false;
  var xhr = new XMLHttpRequest();
  
  xhr.open(method, url, true);
  xhr.timeout = timeout; //due to IE10 bug move after open

  //если запрос cors то проставить хедер который не вызывает preflight запроса
  

  return {
    promise: new q(function(resolve, reject) {
        if(parent_resolve) resolve = parent_resolve;
        if(parent_reject) reject = parent_reject;        

        xhr.onreadystatechange = function () {
          if (this.readyState === this.DONE) {
            //console.log('REQUEST END', this.readyState, ' - ', this.DONE, ' - ', this.status, ' - ', typeof(this.response) === 'string', JSON.parse(this.response), ' - ');

            if (this.status === 200) {
              resolve(typeof(this.response) === 'string' ? JSON.parse(this.response) : this.response);
            } else {
              setTimeout(() => {
                if(was_timeout) {
                  if(reconnect_attempts > 0) {
                    console.error('RECONNECT ATTEMPT BEGIN' + reconnect_attempts);
                    setTimeout(() => http(method, url, object, timeout, reconnect_attempts - 1, resolve, reject), 0);

                  } else {
                    reject(new Error('was timeout on url ' + url));
                  }
                } else {
                  reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
                }
              }, 0);
            }
          }
        };

        xhr.ontimeout = function() {
          was_timeout = true;
        };

        xhr.responseType = 'json';

        xhr.withCredentials = true; //чтобы кука

        if(object!==null && object!==undefined) {
          if(object && object.constructor && object.constructor.toString().indexOf('FormData')>-1) {
            
            xhr.send(object);
          } else {
            //xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify(object));
          }        
        } else {
          xhr.send();
        }
      }),
    abort: xhr.abort
  };
}



//пока говнореализация без параметров и тп
module.exports = function(route, options) {
  var route_tpl = route_template(route);

  var timeout = options && options.timeout || 0;
  var reconnect_attempts = options && options.reconnect_attempts || 0;

  return {
    get: function(obj) {
      return http('GET', route_tpl(text_utils.encode_object_properties(obj)), null, timeout, reconnect_attempts).promise;
    },    
    get_ext: function(obj) {
      return http('GET', route_tpl(text_utils.encode_object_properties(obj)), null, timeout, reconnect_attempts);
    },

    post: function(obj) {
      return http('POST', route_tpl(text_utils.encode_object_properties(obj)), obj, timeout, reconnect_attempts).promise;
    },    
    post_ext: function(obj) {
      return http('POST', route_tpl(text_utils.encode_object_properties(obj)), obj, timeout, reconnect_attempts);
    },
    
    save: function(context, obj) {
      return http('POST', route_tpl(text_utils.encode_object_properties(context)), obj, timeout, reconnect_attempts).promise;
    },
    save_ext: function(context, obj) {
      return http('POST', route_tpl(text_utils.encode_object_properties(context)), obj, timeout, reconnect_attempts);
    }
  };
};
