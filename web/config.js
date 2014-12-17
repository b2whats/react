'use strict';

global.__config = __dirname+'/';
var _ = require('underscore');

if(process.env.OAUTH2=='SERVER') {
  //console.log('ewewewewewewewewewewewewewewewewewewewe');
}

var kHOTELS_DATA_DIR = __dirname + '/../data/hotels/';


var kPOI_BASE = {
  schema: {
    id: [0,'number'],
    lat:[3,'number'], 
    lng:[4,'number']        
  }
};

module.exports = {
  kDEV_RELEASE: '/../client/build/dev',
  kPORT: 3000,
  kUSER_TOKEN_EXPIRE: 25*24*60*60*1000, //25 дней, экспирация логина //110*60*1000,
  kUSER_MASTER_TOKEN_EXPIRE: 25*24*60*60*1000,
  kCACHE_MAIN_PAGE_SECONDS: 0,
  kPREPARE_FOR_TEST: false,
  kHOST_NAME: (process.env.OAUTH2=='SERVER') ? 'http://turk.solvertour.ru' : 'http://www.turk-local.ru',

/*
  kDB: {
    path: (process.platform == 'darwin') ? 'mongodb://localhost/algo2' : 'mongodb://127.0.0.1/algo2', //'mongodb://172.17.42.1/algo2',
    model: 'algo2_db_model'
  },
*/
  kHOTELS: {
    data_dir: __dirname + '/../data/hotels/',
    client_dir: __dirname + '/client/',

    font_css: 'assets/icons/icon-font/flaticon.css',
    poi: _.extend( {path: kHOTELS_DATA_DIR + 'poi_0.txt'}, kPOI_BASE),

    poi_1: _.extend( {path: kHOTELS_DATA_DIR + 'poi_1.txt'}, kPOI_BASE),

    poi_2: _.extend( {path: kHOTELS_DATA_DIR + 'poi_2.txt'}, kPOI_BASE),



    poi_data: {
      path: kHOTELS_DATA_DIR + 'poi_data.txt', //относительно data_dir
      schema: {
        index:[0, 'number'],
        rid:[1,'number'],
        name:[2,'string'], 
        country:[3,'string'],
        lat:[4,'number'], 
        lng:[5,'number'],
        review_length: [6, 'number'], 
        aspect_data: [7, 'json']
      } 
    },
    aspect_dict: {
      path: kHOTELS_DATA_DIR + 'aspects.txt',
      schema: {
        id: [0, 'index'],
        name:[1, 'string']
      }
    },
    //script_dir: __dirname + '/../',
    access: ['any', 'admin'] //доступ всем залогиненым
  }

  /*
  kTASK_SERVICE: {
    empty_task_expiration_period_in_minutes: 60 //60 минут с начала работы над таском дается чтобы его завершить, иначе признается не готовым
  }
  ,

  kPASSPORT: {
    clientID: (process.env.OAUTH2=='SERVER') ?  '974168997044-hbbrnc2rpnjpglm1u0ajdka4qasup00b.apps.googleusercontent.com' : 
                                                '974168997044-q386nhh16pgoecmtsd05oloem8g81bc1.apps.googleusercontent.com',
    clientSecret: (process.env.OAUTH2=='SERVER') ? 'w8wdqvtcmH7uYkea63JudCk4' :
                                                   'eLQ9d7YD0o9AIqXfsKULYQFh'
  }
  */
};
