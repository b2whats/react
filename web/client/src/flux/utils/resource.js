'use strict';

var _ = require('underscore');
var q = require('third_party/es6_promise.js');
_.templateSettings = {
  interpolate: /\:([\w_]+)/g
};

var kCONTENT_TYPE_APPLICATION_JSON = {'Content-Type': 'application/json;charset=utf-8', 'Accept': 'application/json, text/plain, */*'};

function http(method, url, object) {
  
  var xhr = new XMLHttpRequest();        
  xhr.open(method, url, true);
  //если запрос cors то проставить хедер который не вызывает preflight запроса
  if(url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('//') === 0) {
    //не вызывает preflight запроса
    xhr.setRequestHeader("Content-Type","text/plain");
  }

  return {
    promise: new q(function(resolve, reject) {                
        xhr.onreadystatechange = function () {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(typeof(this.response) === 'string' ? JSON.parse(this.response) : this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };

        xhr.responseType = 'json';
        _.each(kCONTENT_TYPE_APPLICATION_JSON, function(v, k) {
          xhr.setRequestHeader(k, v);
        });
        
        if(object!==null && object!==undefined) {
          xhr.send(JSON.stringify(object));
        } else {
          xhr.send();
        }
      }),
    abort: xhr.abort
  };
}

var encode_object_properties = (obj) => {
  return _.reduce(obj, (memo, v, k) => {
    memo[k] = _.isString(v) ? encodeURIComponent(v) : v;
    return memo;
  }, {});
};

//пока говнореализация без параметров и тп
module.exports = function(route) {
  var route_tpl = _.template(route);

  return {
    get: function(obj) {
      return http('GET', route_tpl(encode_object_properties(obj))).promise;
    },    
    get_ext: function(obj) {
      return http('GET', route_tpl(encode_object_properties(obj)));
    },

    post: function(obj) {
      return http('POST', route_tpl(encode_object_properties(obj)), obj).promise;
    },    
    post_ext: function(obj) {
      return http('POST', route_tpl(encode_object_properties(obj)), obj);
    },
    
    save: function(context, obj) {
      return http('POST', route_tpl(encode_object_properties(context)), obj).promise;
    },
    save_ext: function(context, obj) {
      return http('POST', route_tpl(encode_object_properties(context)), obj);
    }
  };
};
