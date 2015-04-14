'use strict';

//enum
var event_names = {

  //TODO перейменовать в kSYS_блабла
  kON_CHANGE: 'kON_CHANGE',

  kCHANGE_GENERAL_TOGGLE: 'kCHANGE_GENERAL_TOGGLE',

  //route events
  kON_ROUTE_WILL_CHANGE: 'kON_BEFORE_ROUTE_CHANGE',
  kON_ROUTE_DID_CHANGE: 'kON_ROUTE_DID_CHANGE',
  kON_ROUTE_CHANGE_ERROR: 'kON_ROUTE_CHANGE_ERROR',

  //kON_WORK_FEATURE_CHECKED: 'kON_WORK_FEATURE_CHECKED',

  //suggestions
  kON_AUTO_PART_SUGGESTION_DATA_LOADED: 'kON_AUTO_PART_SUGGESTION_DATA_LOADED',  //юзер выбрал деталь в typeahead
  kON_AUTO_PART_SUGGESTION_VALUE_CHANGED: 'kON_AUTO_PART_SUGGESTION_VALUE_CHANGED', //надпись в тайпахеде изменилась
  kON_AUTO_PART_SUGGESTION_SEARCH_TERM_CHANGED: 'kON_AUTO_PART_SUGGESTION_SEARCH_TERM_CHANGED', //событие для показать в тайпахеде что то свое
  kON_AUTO_PART_SUGGESTION_SHOW_VALUE_CHANGED: 'kON_AUTO_PART_SUGGESTION_SHOW_VALUE_CHANGED', //пришли данные с сервера


  kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED', //юзер выбрал сервис в typeahead
  kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED', //надпись в тайпахеде изменилась
  kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED', //событие для показать в тайпахеде что то свое
  kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED: 'kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED', //пришли данные с сервера

  kON_REGION_LIST_LOADED: 'kON_REGION_LIST_LOADED',
  kON_REGION_CHANGED: 'kON_REGION_CHANGED',
  kON_CHANGE_REGION_SELECTION: 'kON_CHANGE_REGION_SELECTION',


  kON_DEFAULT_PAGE_SIZE_CHANGED: 'kON_DEFAULT_PAGE_SIZE_CHANGED',


  kON_SEARCH_PAGE_SIZE_CHANGED: 'kON_SEARCH_PAGE_SIZE_CHANGED', //на ресайз
  kON_SEARCH_PAGE_CHANGE_MAP_VISIBILITY: 'kON_SEARCH_PAGE_CHANGE_MAP_VISIBILITY', //на кнопку показать скрыть карту
  
  kON_SEARCH_PAGE_HEADER_RATING_STAR_HOVER: 'kON_SEARCH_PAGE_HEADER_RATING_STAR_HOVER', //по звездочкам рейтинга водим мышкой
  kON_SEARCH_PAGE_HEADER_RATING_STAR_CLICK: 'kON_SEARCH_PAGE_HEADER_RATING_STAR_CLICK',  //по звездочкам рейтинга кликаем

  kON_AUTO_PART_BY_ID_DATA_LOADED: 'kON_AUTO_PART_BY_ID_DATA_LOADED', //данные по детали по id
  kON_AUTO_PART_BY_ID_RESET_DATA: 'kON_AUTO_PART_BY_ID_RESET_DATA', 
  kON_AUTO_PART_BY_ID_TOGGLE_BALLOON: 'kON_AUTO_PART_BY_ID_TOGGLE_BALLOON',
  kON_AUTO_PART_BY_ID_CLOSE_ALL_BALLOON: 'kON_AUTO_PART_BY_ID_CLOSE_ALL_BALLOON',
  kON_AUTO_PART_BY_ID_CLOSE_BALLOON: 'kON_AUTO_PART_BY_ID_CLOSE_BALLOON',
  kON_AUTO_PART_BY_ID_SHOW_PHONE: 'kON_AUTO_PART_BY_ID_SHOW_PHONE',
  kON_AUTO_PART_BY_ID_MARKER_HOVER: 'kON_AUTO_PART_BY_ID_MARKER_HOVER',
  kON_AUTO_PART_BY_ID_BALLOON_VISIBLE: 'kON_AUTO_PART_BY_ID_BALLOON_VISIBLE',
  kON_AUTO_PART_BY_ID_MAP_BOUNDS_CHANGED_BY_USER: 'kON_AUTO_PART_BY_ID_MAP_BOUNDS_CHANGED_BY_USER',
  kON_AUTO_PART_BY_ID_CHANGE_ITEMS_PER_PAGE: 'kON_AUTO_PART_BY_ID_CHANGE_ITEMS_PER_PAGE',
  kON_AUTO_PART_BY_ID_CHANGE_PAGE: 'kON_AUTO_PART_BY_ID_CHANGE_PAGE',
  kON_AUTO_PART_BY_ID_SHOW_ALL_PHONES_ON_CURRENT_PAGE: 'kON_AUTO_PART_BY_ID_SHOW_ALL_PHONES_ON_CURRENT_PAGE',


  kON_AUTOSERVICE_BY_ID_DATA_LOADED: 'kON_AUTOSERVICE_BY_ID_DATA_LOADED', //данные по сервису по id
  kON_AUTOSERVICE_BY_ID_RESET_DATA: 'kON_AUTOSERVICE_BY_ID_RESET_DATA',
  kON_AUTOSERVICE_BY_ID_TOGGLE_BALLOON:'kON_AUTOSERVICE_BY_ID_TOGGLE_BALLOON',
  kON_AUTOSERVICE_BY_ID_CLOSE_ALL_BALLOON:'kON_AUTOSERVICE_BY_ID_CLOSE_ALL_BALLOON',
  kON_AUTOSERVICE_BY_ID_CLOSE_BALLOON:'kON_AUTOSERVICE_BY_ID_CLOSE_BALLOON',
  kON_AUTOSERVICE_BY_ID_SHOW_PHONE:'kON_AUTOSERVICE_BY_ID_SHOW_PHONE',
  kON_AUTOSERVICE_BY_ID_MARKER_HOVER:'kON_AUTOSERVICE_BY_ID_MARKER_HOVER',
  kON_AUTOSERVICE_BY_ID_BALLOON_VISIBLE: 'kON_AUTOSERVICE_BY_ID_BALLOON_VISIBLE',
  kON_AUTOSERVICE_BY_ID_MAP_BOUNDS_CHANGED_BY_USER: 'kON_AUTOSERVICE_BY_ID_MAP_BOUNDS_CHANGED_BY_USER',
  kON_AUTOSERVICE_BY_ID_CHANGE_ITEMS_PER_PAGE: 'kON_AUTOSERVICE_BY_ID_CHANGE_ITEMS_PER_PAGE',
  kON_AUTOSERVICE_BY_ID_CHANGE_PAGE: 'kON_AUTOSERVICE_BY_ID_CHANGE_PAGE',
  kON_AUTOSERVICE_BY_ID_SHOW_ALL_PHONES_ON_CURRENT_PAGE: 'kON_AUTOSERVICE_BY_ID_SHOW_ALL_PHONES_ON_CURRENT_PAGE',

  kON_CATALOG_BRANDS_DATA_LOADED: 'kON_CATALOG_BRANDS_DATA_LOADED',
  kON_CATALOG_SERVICES_DATA_LOADED: 'kON_CATALOG_SERVICES_DATA_LOADED',
  kON_CATALOG_PARAMS_CHANGED: 'kON_CATALOG_PARAMS_CHANGED',

  kON_CATALOG_APPEND_BRAND_TAG: 'kON_APPEND_BRAND_TAG',
  kON_CATALOG_REMOVE_BRAND_TAG: 'kON_CATALOG_REMOVE_BRAND_TAG',

  kON_CATALOG_APPEND_SERVICE_TAG: 'kON_CATALOG_APPEND_SERVICE_TAG',
  kON_CATALOG_REMOVE_SERVICE_TAG: 'kON_CATALOG_REMOVE_SERVICE_TAG',

  kON_CATALOG_DATA_LOADED: 'kON_CATALOG_DATA_LOADED',
    
  kON_CATALOG_RESET_DATA: 'kON_CATALOG_RESET_DATA',
  kON_CATALOG_TOGGLE_BALLOON: 'kON_CATALOG_TOGGLE_BALLOON',
  kON_CATALOG_CLOSE_ALL_BALLOON: 'kON_CATALOG_CLOSE_ALL_BALLOON',
  kON_CATALOG_CLOSE_BALLOON: 'kON_CATALOG_CLOSE_BALLOON',
  kON_CATALOG_SHOW_PHONE: 'kON_CATALOG_SHOW_PHONE',
  kON_CATALOG_MARKER_HOVER: 'kON_CATALOG_MARKER_HOVER',
  kON_CATALOG_BALLOON_VISIBLE: 'kON_CATALOG_BALLOON_VISIBLE',
  kON_CATALOG_MAP_BOUNDS_CHANGED_BY_USER: 'kON_CATALOG_MAP_BOUNDS_CHANGED_BY_USER',
  kON_CATALOG_CHANGE_ITEMS_PER_PAGE: 'kON_CATALOG_CHANGE_ITEMS_PER_PAGE',
  kON_CATALOG_CHANGE_PAGE: 'kON_CATALOG_CHANGE_PAGE',
  kON_CATALOG_SEARCH: 'kON_CATALOG_SEARCH',
  kON_CATALOG_SHOW_ALL_PHONES_ON_CURRENT_PAGE: 'kON_CATALOG_SHOW_ALL_PHONES_ON_CURRENT_PAGE',
  

  kON_TOOLTIP_SHOW: 'kON_TOOLTIP_SHOW',

  kON_MODAL_SHOW: 'kON_MODAL_SHOW',
  kON_MODAL_HIDE: 'kON_MODAL_HIDE',

  kON_TEST_VALUE: 'kON_TEST_VALUE',
  kON_TEST_TOGGLE_BALLOON: 'kON_TEST_TOGGLE_BALLOON',
  kON_TEST_CLOSE_BALLOON: 'kON_TEST_CLOSE_BALLOON',
  kON_TEST_SHOW_PHONE: 'kON_TEST_SHOW_PHONE',

  kON_FORM_START_EDIT: 'kON_FORM_START_EDIT',
  kON_FORM_END_EDIT: 'kON_FORM_END_EDIT',
  kON_FORM_UPDATE: 'kON_FORM_UPDATE',
  kON_FORM_SUBMIT: 'kON_FORM_SUBMIT',
  kON_FORM_RESET_VALIDATE: 'kON_FORM_RESET_VALIDATE',
  kON_FORM_RESET: 'kON_FORM_RESET',


  kACCOUNT_COMPANY_INFO_LOADED: 'kACCOUNT_COMPANY_INFO_LOADED',
  kPERSONAL_COMPANY_INFO_LOADED: 'kPERSONAL_COMPANY_INFO_LOADED',
  kACCOUNT_COMPANY_FILIALS_LOADED: 'kACCOUNT_COMPANY_FILIAL_LOADED',
  kACCOUNT_COMPANY_FILIALS_UPDATE: 'kACCOUNT_COMPANY_FILIALS_UPDATE',
  kON_CURRENT_FILIAL_CHANGE: 'kON_CURRENT_FILIAL_CHANGE',
  kON_NEW_FILIAL: 'kON_NEW_FILIAL',
  kON_FILIAL_DELETE: 'kON_FILIAL_DELETE',
  kON_COMPANY_PERSONAL_DETAILS_UPDATE: 'kON_COMPANY_PERSONAL_DETAILS_UPDATE',


  kON_FILIAL_ADDRESS_AND_WORK_TIME_RESET: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_RESET',
  kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_ADDRESS_CHANGED',
  kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_COORDS_CHANGED',
  kON_FILIAL_ADDRESS_AND_WORK_TIME_METADATA_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_METADATA_CHANGED',
  
  kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_HOLIDAY_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_HOLIDAY_CHANGED',
  
  kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_TYPE_CHANGED',
  kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_PHONE_CHANGED',

  
  kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_FROM_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_FROM_CHANGED',
  kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_TO_CHANGED: 'kON_FILIAL_ADDRESS_AND_WORK_TIME_WORK_TIME_TO_CHANGED',


  kON_PRICE_LIST_SELECTOR_UPDATE_POSITION: 'kON_PRICE_LIST_SELECTOR_UPDATE_POSITION',
  kON_PRICE_LIST_SELECTOR_RESET: 'kON_PRICE_LIST_SELECTOR_RESET',
  kON_PRICE_LIST_SELECTOR_UPDATE_POSITION_BY_PRICE: 'kON_PRICE_LIST_SELECTOR_UPDATE_POSITION_BY_PRICE',
  kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_FIX: 'kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_FIX',
  kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_PERCENT: 'kON_PRICE_LIST_SELECTOR_UPDATE_DELTA_PERCENT',
  kON_PRICE_LIST_SELECTOR_ADD_POSITION: 'kON_PRICE_LIST_SELECTOR_ADD_POSITION',
  kON_PRICE_LIST_SELECTOR_INIT_SUPPLIERS: 'kON_PRICE_LIST_SELECTOR_INIT_SUPPLIERS',
  kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE: 'kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE',
  kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE_INFO: 'kON_PRICE_LIST_SELECTOR_INIT_PRICE_RANGE_INFO',
  kON_PRICE_LIST_SELECTOR_PRICE_RANGE_UPDATE: 'kON_PRICE_LIST_SELECTOR_PRICE_RANGE_UPDATE',
  kON_PRICE_LIST_SELECTOR_PRICE_RANGE_DELETE: 'kON_PRICE_LIST_SELECTOR_PRICE_RANGE_DELETE',
  kON_PRICE_LIST_SELECTOR_CURRENT_SUPPLIER_CHANGED: 'kON_PRICE_LIST_SELECTOR_CURRENT_SUPPLIER_CHANGED',




  kREGISTER_STATUS_ERROR: 'kREGISTER_STATUS_ERROR',
	kREGISTER_STATUS_SUCCESS: 'kREGISTER_STATUS_SUCCESS',
  kAUTH_STATUS_RESET: 'kAUTH_STATUS_RESET',
	kAUTH_STATUS_ERROR: 'kAUTH_STATUS_ERROR',
	kAUTH_STATUS_SUCCESS: 'kAUTH_STATUS_SUCCESS',
  kAUTH_STATUS_CHECK_DONE: 'kAUTH_STATUS_CHECK_DONE',
	kAUTH_SAVE_PATH: 'kAUTH_SAVE_PATH',


  kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED: 'kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED',
  kACCOUNT_PRICE_INFO_LOADED: 'kACCOUNT_PRICE_INFO_LOADED',
  kACCOUNT_PRICE_DELETE: 'kACCOUNT_PRICE_DELETE',
  kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_RESET: 'kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_RESET',
  kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS: 'kON_ON_ACCOUNT_MANAGE_PRICE_LIST_LOADED_ERRORS',
  kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED: 'kON_ON_ACCOUNT_MANAGE_PRICE_PROPERTY_CHANGED',
  kON_ON_ACCOUNT_MANAGE_PRICE_LIST_CONTENT_CHANGED: 'kON_ON_ACCOUNT_MANAGE_PRICE_LIST_CONTENT_CHANGED',
  kON_ON_ACCOUNT_MANAGE_PRICE_TYPE_CHANGED: 'kON_ON_ACCOUNT_MANAGE_PRICE_TYPE_CHANGED',

  kACCOUNT_SERVICES_INFO_LOADED: 'kACCOUNT_SERVICES_INFO_LOADED',
  kACCOUNT_SERVICES_CHANGE_STEP: 'kACCOUNT_SERVICES_CHANGE_STEP',
  kACCOUNT_SERVICES_TOGGLE: 'kACCOUNT_SERVICES_TOGGLE',
  kACCOUNT_SERVICES_CHANGE_TARIF: 'kACCOUNT_SERVICES_CHANGE_TARIF',
  kACCOUNT_SERVICES_CHANGE_BRANDS: 'kACCOUNT_SERVICES_CHANGE_BRANDS',
  kACCOUNT_SERVICES_CHANGE_SERVICES: 'kACCOUNT_SERVICES_CHANGE_SERVICES',
  kACCOUNT_SERVICES_CHANGE_PAYMENT_METHOD: 'kACCOUNT_SERVICES_CHANGE_PAYMENT_METHOD',
  kACCOUNT_SERVICES_CHANGE_MASTERS_NAME: 'kACCOUNT_SERVICES_CHANGE_MASTERS_NAME',

  COMMENT_FORM_UPDATE: 'COMMENT_FORM_UPDATE',
  kSUBMIT_COMMENT_STATUS_ERROR: 'kSUBMIT_COMMENT_STATUS_ERROR',
  kSUBMIT_COMMENT_STATUS_RESET: 'kSUBMIT_COMMENT_STATUS_RESET',
  kSUBMIT_COMMENT_SUCCESS: 'kSUBMIT_COMMENT_SUCCESS',


};

module.exports = event_names;
