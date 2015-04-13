'use strict';


var kAPI_HOST = 'http://autogiper.com';
module.exports = {
  kAUTO_PART_SUGGESTER_API: kAPI_HOST + '/api/search.php?type=autoparts&text=:words',
  kAUTO_SERVICE_SUGGESTER_API: kAPI_HOST + '/api/search.php?type=autoservices&text=:words',
  kREGIONS_QUERY_API: kAPI_HOST + '/api/get/regions.php',

  kAUTO_PART_BY_ID_API: kAPI_HOST + '/api/search.php?type=autoparts&id=:id&region_text=:region_text',
  kAUTO_SERVICE_BY_ID_API: kAPI_HOST + '/api/search.php?type=autoservices&id=:id&region_text=:region_text',

  kCATALOG_SERVICES: kAPI_HOST + '/api/get/services.php',
  kCATALOG_BRANDS: kAPI_HOST + '/api/get/brands.php',
  kCATALOG_DATA: kAPI_HOST + '/api/catalog.php?type=:type&brand=:brands&service=:services&region_text=:region_text',

  kACCOUNT_COMPANY_INFO: kAPI_HOST + '/api/get/company_info.php',
  kACCOUNT_COMPANY_INFO_UPDATE: kAPI_HOST + '/api/set/company_info.php',
  kACCOUNT_COMPANY_FILIAL: kAPI_HOST + '/api/get/company_filial.php',
  kACCOUNT_COMPANY_FILIAL_UPDATE: kAPI_HOST + '/api/set/company_filial.php?filial_id=:filial_id',
  kACCOUNT_COMPANY_FILIAL_DELETE: kAPI_HOST + '/api/del/company_filial.php?filial_id=:filial_id',
  kACCOUNT_COMPANY_PERSONAL_DETAILS: kAPI_HOST + '/api/company/personal_detail.php?type=:type',

  kACCOUNT_SERVICES_INFO: kAPI_HOST + '/api/services/services.php?type=:type',
  kACCOUNT_PRICES_HISTORY_INFO: kAPI_HOST + '/api/manage/history.php?type=:type',
  kACCOUNT_PRICES_DELETE: kAPI_HOST + '/api/manage/history.php?type=:type',
  kACCOUNT_SERVICES_PAYMENT: kAPI_HOST + '/api/services/payment.php',

  kSUBMIT_REGISTER_DATA: kAPI_HOST + '/api/register.php',
  kAUTH: kAPI_HOST + '/api/auth.php',  //Передавать с параметрами
  kAUTH_CHECK: kAPI_HOST + '/api/auth.php', //Чек идет без параметров
  kAUTH_LOG_OUT: kAPI_HOST + '/api/logout.php',


  kACCOUNT_MANAGE_UPLOAD_FILE: kAPI_HOST + '/api/upload_file.php?operation_id=:operation_id&price_type=:price_type',
  kACCOUNT_MANAGE_WHOLESALE_PRICE_INFO: kAPI_HOST + '/api/manage/wholesale.php?type=:type',

  GET: kAPI_HOST + '/api/get.php',

};

//проверка ремот кук http://autogiper.com/api/test.php
