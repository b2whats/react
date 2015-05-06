/*
смысл сериализатора -
не посылать следующий асинхронный запрос пока не получен ответ от предыдущего
если запросов несколько выполнять свертку - то есть вызывать только последний

всегда получает на вход promise, и abort метод
если abort определен то вызывает его перед тем как вызвать новый метод
*/

//const _ = require('underscore');
//const q = Promise;
const K_SKIP_ERROR = 'K_SKIP_ERROR';

const serialize = (promiseCaller) => {
  let isInRequest = false;
  let lastPromiseInvoke = null;
  let lastPromiseReject = null;

  const callNext = () => {
    if (lastPromiseInvoke!==null) {
      isInRequest = true;
      lastPromiseInvoke();

      lastPromiseInvoke = null;
      lastPromiseReject = null;
    }
  };

  const wrapPromise = (promise) => {
    return promise
    .then(res => {
      isInRequest = false;
      callNext();
      return res;
    })
    .catch(e => {
      console.error(e, e.stack); //eslint-disable-line no-console
      isInRequest = false;
      callNext();
      throw e;
    });
  };


  return (...args) => {
    if (!isInRequest) {
      isInRequest = true;
      return wrapPromise(promiseCaller.apply(null, args));
    }

    if (lastPromiseReject!==null) {
      lastPromiseReject();
      lastPromiseInvoke = null;
      lastPromiseReject = null;
    }

    return new Promise((resolve, reject) => {
      lastPromiseInvoke = () => {
        wrapPromise(promiseCaller.apply(null, args))
        .then(res => resolve(res))
        .catch(e => reject(e));
      };

      lastPromiseReject = () => {
        reject(new Error(K_SKIP_ERROR));
      };
    });
  };
};


module.exports = serialize;
module.exports.is_skip_error = (e) => e.message === K_SKIP_ERROR;


/*
//test
const prom_c_0 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(0), 100);
  });
};

const prom_c_1 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(1), 100);
  });
};

const prom_c_2 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(2), 100);
  });
};

const prom_c_3 = () => {
  return new q((res, rej) => {
    setTimeout(() => res(3), 100);
  });
};

const serializer = create_serializer();

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
