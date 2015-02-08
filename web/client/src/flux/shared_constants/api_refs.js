'use strict';


var domen = 'http://autogiper.com';
module.exports = {
  kAUTO_PART_SUGGESTER_API: domen + '/api/search.php?type=autoparts&text=:words',
  kAUTO_SERVICE_SUGGESTER_API: domen + '/api/search.php?type=autoservices&text=:words',
  kREGIONS_QUERY_API: domen + '/api/get/regions.php',

  kAUTO_PART_BY_ID_API: domen + '/api/search.php?type=autoparts&id=:id&region_text=:region_text',
  kAUTO_SERVICE_BY_ID_API: domen + '/api/search.php?type=autoservices&id=:id&region_text=:region_text',

  kCATALOG_SERVICES: domen + '/api/get/services.php',
  kCATALOG_BRANDS: domen + '/api/get/brands.php',
  kCATALOG_DATA: domen + '/api/catalog.php?type=:type&brand=:brands&service=:services&region_text=:region_text',

  kACCOUNT_COMPANY_INFO: domen + '/api/get/company_info.php',
  kACCOUNT_COMPANY_INFO_UPDATE: domen + '/api/set/company_info.php',
  kACCOUNT_COMPANY_FILIAL: domen + '/api/get/company_filial.php',
  kACCOUNT_COMPANY_FILIAL_UPDATE: domen + '/api/set/company_filial.php?filial_id=:filial_id',
  kACCOUNT_COMPANY_FILIAL_DELETE: domen + '/api/del/company_filial.php?filial_id=:filial_id',

  kSUBMIT_REGISTER_DATA: domen + '/api/register.php',
  kAUTH: domen + '/api/auth.php',  //Передавать с параметрами
  kAUTH_CHECK: domen + '/api/auth.php', //Чек идет без параметров
  kAUTH_LOG_OUT: domen + '/api/logout.php',

};

//проверка ремот кук http://autogiper.com/api/test.php
