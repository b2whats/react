'use strict';

//enum
var event_names = {

  //TODO перейменовать в kSYS_блабла
  kON_CHANGE: 'kON_CHANGE',


  kON_RECOMMENDER_DATA_LOADED: 'kON_RECOMMENDER_DATA_LOADED',
  kON_RECOMMENDER_DATA_SAVED: 'kON_RECOMMENDER_DATA_SAVED',

  //kON_BIN_DATA_CHANGED: 'kON_BIN_DATA_CHANGED', 

  kON_BIN_TITLE_CHANGED: 'kON_BIN_TITLE_CHANGED', 
  kON_BIN_WEIGHT_CHANGED: 'kON_BIN_WEIGHT_CHANGED', 

  kON_BIN_FEATURE_CHANGED: 'kON_BIN_FEATURE_CHANGED',
  kON_BIN_FEATURE_WEIGHT_CHANGED: 'kON_BIN_FEATURE_WEIGHT_CHANGED',

  kON_BIN_RULE_CHANGED: 'kON_BIN_RULE_CHANGED',
  kON_BIN_RULE_WEIGHT_CHANGED: 'kON_BIN_RULE_WEIGHT_CHANGED',
  kON_BIN_RULE_VALUE_CHANGED: 'kON_BIN_RULE_VALUE_CHANGED',

  //page events
  kON_PAGE_CHANGED: 'kON_PAGE_CHANGED',

  //route events
  kON_ROUTE_WILL_CHANGE: 'kON_BEFORE_ROUTE_CHANGE',
  kON_ROUTE_DID_CHANGE: 'kON_ROUTE_DID_CHANGE',
  kON_ROUTE_CHANGE_ERROR: 'kON_ROUTE_CHANGE_ERROR',

  kON_WORK_FEATURE_CHECKED: 'kON_WORK_FEATURE_CHECKED',

  //suggestions
  kON_AUTO_PART_SUGGESTION_DATA_LOADED: 'kON_AUTO_PART_SUGGESTION_DATA_LOADED',
  kON_AUTO_PART_SUGGESTION_VALUE_CHANGED: 'kON_AUTO_PART_SUGGESTION_VALUE_CHANGED',
  kON_AUTO_PART_SUGGESTION_SEARCH_TERM_CHANGED: 'kON_AUTO_PART_SUGGESTION_SEARCH_TERM_CHANGED',
  kON_AUTO_PART_SUGGESTION_SHOW_VALUE_CHANGED: 'kON_AUTO_PART_SUGGESTION_SHOW_VALUE_CHANGED',


  kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_VALUE_CHANGED',
  kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_SEARCH_TERM_CHANGED',
  kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED: 'kON_AUTO_SERVICE_SUGGESTION_SHOW_VALUE_CHANGED',
  kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED: 'kON_AUTO_SERVICE_SUGGESTION_DATA_LOADED',

  kON_REGION_LIST_LOADED: 'kON_REGION_LIST_LOADED',
  kON_REGION_CHANGED: 'kON_REGION_CHANGED',
  kON_CHANGE_REGION_SELECTION: 'kON_CHANGE_REGION_SELECTION',


  kON_DEFAULT_PAGE_SIZE_CHANGED: 'kON_DEFAULT_PAGE_SIZE_CHANGED',
  kON_SEARCH_PAGE_SIZE_CHANGED: 'kON_SEARCH_PAGE_SIZE_CHANGED'



};

module.exports = event_names;
