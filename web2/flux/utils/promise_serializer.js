'use strict';
/*
смысл сериализатора - 
не посылать следующий асинхронный запрос пока не получен ответ от предыдущего
если запросов несколько выполнять свертку - то есть вызывать только последний

всегда получает на вход promise, и abort метод
если abort определен то вызывает его перед тем как вызвать новый метод
*/

//var _ = require('underscore');
var q = Promise;
var kSKIP_ERROR = 'kSKIP_ERROR';

var create_serializer = () => {
  var is_in_request_ = false;
  
  var last_promise_invoke_ = null;
  var last_promise_reject_ = null;
  
  var call_next = () => {
    if(last_promise_invoke_!==null) {
      is_in_request_ = true;
      last_promise_invoke_ ();
      
      last_promise_invoke_ = null;
      last_promise_reject_ = null;
    }
  };

  var wrap_promise = (promise) => {
    return promise
    .then(res => {
      is_in_request_ = false;
      call_next();
      return res;
    })
    .catch(e => {
      console.error(e, e.stack);
      is_in_request_ = false;
      call_next();
      throw e;
    });
  };

  return (promise_caller) => {

    if(!is_in_request_) {
      is_in_request_ = true;
      return wrap_promise(promise_caller());
    } else { //is_in_request_
      
      if(last_promise_reject_!==null) {
        last_promise_reject_();
        last_promise_invoke_ = null;
        last_promise_reject_ = null;
      }

      return new q(function(resolve, reject) {
        
        last_promise_invoke_ = () => {
          wrap_promise(promise_caller())
          .then(res => resolve(res))
          .catch(e => reject(e));
        };
        
        last_promise_reject_ = () => {
          reject(new Error(kSKIP_ERROR));
        };
      });
    }
  };
};

module.exports.create_serializer = create_serializer;
module.exports.is_skip_error = (e) => e.message === kSKIP_ERROR;


/*
//test
var prom_c_0 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(0), 100);
  });
};

var prom_c_1 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(1), 100);
  });
};

var prom_c_2 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(2), 100);
  });
};

var prom_c_3 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(3), 100);
  });
};

var serializer = create_serializer();

serializer(prom_c_0)
.then(r => console.log(r))
.catch(e => console.error(0, e))

serializer(prom_c_1)
.then(r => console.log(r))
.catch(e => console.error(1, e))


serializer(prom_c_2)
.then(r => console.log(r))
.catch(e => console.error(2, e))

serializer(prom_c_3)
.then(r => console.log(r))
.catch(e => console.error(3, e))

*/


