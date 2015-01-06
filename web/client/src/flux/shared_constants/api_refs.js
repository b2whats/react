'use strict';

module.exports = {
  kAUTO_PART_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoparts&text=:words',
  kAUTO_SERVICE_SUGGESTER_API: 'http://autogiper.com/api/search.php?type=autoservices&text=:words',
  kREGIONS_QUERY_API: 'http://autogiper.com/api/get/regions.php',

  kAUTO_PART_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoparts&id=:id&region_text=:region_text',
  kAUTO_SERVICE_BY_ID_API: 'http://autogiper.com/api/search.php?type=autoservices&id=:id&region_text=:region_text'
};

//проверка ремот кук http://autogiper.com/api/test.php
