'use strict';

module.exports = {
  kAUTO_PART_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoparts&text=:words',
  kAUTO_SERVICE_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoservices&text=:words',
  kREGIONS_QUERY_API: 'http://autogiper.com/api/get/regions.php',

  kAUTO_PART_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoparts&id=:id&region_text=:region_text',
  kAUTO_SERVICE_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoservices&id=:id&region_text=:region_text',

  kCATALOG_SERVICES: 'http://autogiper.com/api/get/services.php',
  kCATALOG_BRANDS: 'http://autogiper.com/api/get/brands.php',
  kCATALOG_DATA: 'http://autogiper.com/api/catalog.php?type=:type&brand=:brands&service=:services&region_text=:region_text',

  kACCOUNT_COMPANY_INFO: 'http://autogiper.com/api/get/company_info.php?id=:company_id',
  kACCOUNT_COMPANY_INFO_UPDATE: 'http://autogiper.com/api/set/company_info.php',
  kACCOUNT_COMPANY_FILIAL: 'http://autogiper.com/api/get/company_filial.php?company_id=:company_id',

};

//проверка ремот кук http://autogiper.com/api/test.php
