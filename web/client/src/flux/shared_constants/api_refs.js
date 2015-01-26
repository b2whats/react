'use strict';

module.exports = {
  kAUTO_PART_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoparts&text=:words',
  kAUTO_SERVICE_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoservices&text=:words',
  kREGIONS_QUERY_API: 'http://autogiper.com/api/get/regions.php',

  kAUTO_PART_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoparts&id=:id&region_text=:region_text',
  kAUTO_SERVICE_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoservices&id=:id&region_text=:region_text',

  kCATALOG_SERVICES: 'http://avtogiper.ru/api/get/services.php',
  kCATALOG_BRANDS: 'http://avtogiper.ru/api/get/brands.php',
  kCATALOG_DATA: 'http://autogiper.ru/api/catalog.php?type=:type&brand=:brands&service=:services&region_text=:region_text',
};

//проверка ремот кук http://autogiper.com/api/test.php
