'use strict';

global.__config = __dirname+'/';
var _ = require('underscore');
//var Sequelize = require('sequelize');

/*
var db_config = {
  kSQL_LITE_DB_PATH: __dirname + '/data',
  kSQL_LITE_DB_NAME: 'liteurl',
};

var sequelize = new Sequelize(db_config.kSQL_LITE_DB_NAME, 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5, min: 0, idle: 10000
  },
  logging: false,
  storage: db_config.kSQL_LITE_DB_PATH + '/' + db_config.kSQL_LITE_DB_NAME + '.sqlite' // SQLite only
  //storage: ':memory:'
});


var LiteUrl = sequelize.define('liteurl', {
  key: {
    type: Sequelize.UUID,
    unique: true,
    defaultValue: Sequelize.UUIDV4
  },
  json: {
    type: Sequelize.STRING,
    field: 'json' // Will result in an attribute that is firstName when user facing but first_name in the database
  }
}, {
  freezeTableName: true, //имя тоже liteurl а не liteurls
  timestamps: true,
});
*/


module.exports = {
  kSERVER_PATH: process.env.SERVER_PATH,
  kIS_PRODUCTION: process.env.NODE_ENV === "production",
  kDEV_RELEASE: __dirname+'/build',
  kPORT: 3000,
  kUSER_TOKEN_EXPIRE: 25*24*60*60*1000, //25 дней, экспирация логина //110*60*1000,
  kUSER_MASTER_TOKEN_EXPIRE: 25*24*60*60*1000,
  kCACHE_MAIN_PAGE_SECONDS: 0,
  kPREPARE_FOR_TEST: false,
  kDB: {
    //LiteUrl: LiteUrl
  },
};

