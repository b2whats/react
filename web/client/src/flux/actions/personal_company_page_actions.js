'use strict';
var _ = require('underscore');

var main_dispatcher = require('dispatchers/main_dispatcher.js');

var event_names = require('shared_constants/event_names.js');
var api_refs = require('shared_constants/api_refs.js');
var immutable = require('immutable');

var validator = require('revalidator');
var resource = require('utils/resource.js');
var action_export_helper = require('utils/action_export_helper.js');

var sass_vars = require('sass/common_vars.json')['yandex-map'];

var kCATALOG_DELTA_ID = [0, 10000000];
var kCATALOG_MARKER_TYPE = ['auto-part-marker-type', 'autoservice-marker-type'];
var kCATALOG_HINT = ['автозапчасти', 'автосервис'];
var kCATALOG_MARKER_COLOR = [sass_vars['auto-part-marker-color'], sass_vars['autoservice-marker-color']];
var kCATALOG_CLUSTER_COLOR = [sass_vars['cluster-marker-color'], sass_vars['cluster-marker-color']];

module.exports.get_company_information = (id) => {
  return resource(api_refs.GET)
    .post({company_by_id: id, company_filials_by_company_id: id, reviews_by_company_id: id})
    .then(response => {

      if(_.isArray(response.results.company_filials) && response.results.company_filials.length === 0) {
        return {markers:[], results:[]};
      }
      //чистим данные с сервера
      var map_user_id = _.reduce(response.results.company_filials, (memo,marker) => {
        memo[marker.user_id] = true;
        return memo;
      }, {});

      var res_user_id = _.reduce(response.results.company_filials, (memo,marker) => {
        memo[marker.user_id] = true;
        return memo;
      }, {});

      var markers = _.filter(response.results.company_filials, m => m.user_id in res_user_id);

      markers = _.map(markers, (m, m_index) =>
        _.extend( {
            is_open: false,         //true если с этой метки открыт balloon или надо открыть-закрыть балун
            show_phone: false,      //показывать ли телефон
            balloon_visible: false, //конкретно именно этот balloon открыт на экране,
                                    //в случае кластера может отличаться от is_open,
                                    //например открыли балун по одной метке и переместились стрелками в карусели кластер балуна на другой
                                    //наличие этого поля объясняется неимоверной хреновостью yandex map api
            on_current_page: true, //есть ли иконка на текущей старничке в табличке
          }, //system
          {
            marker_color: kCATALOG_MARKER_COLOR[m.filial_type - 1], //так как цвета маркера задаются в апи явно то вынужден писать их тут а не в css
            marker_type: kCATALOG_MARKER_TYPE[m.filial_type - 1],   //тип метки - автосервис или запчасть
            hint: kCATALOG_HINT[m.filial_type - 1] + m.company_name //хинт что показывать на метке
          }, //брать потом из базы
          {
            cluster_color: kCATALOG_CLUSTER_COLOR[m.filial_type - 1] //цвет иконки кластера
          },
          m,
          {
            server_id:m.id,    //настоящий id
            id: m.id + kCATALOG_DELTA_ID[m.filial_type - 1],          //смещенный id
            icon_number:m_index +1 //циферка на иконке
          } ));


      markers = _.sortBy(markers, m => m.rank);

      var results = _.filter(response.results.company_filials, m => m.user_id in map_user_id);

      results = _.map(results, res => _.extend({},
        res,
        {
          is_hovered_same_rank: false,            //наведено на результат на карте или так
          is_hovered_same_address: false,         //наведено на результат и адрес совпадает с основным на карте или так
          is_balloon_visible_same_rank: false,    //открыт балун с таким же ранком
          is_balloon_visible_same_address: false  //открыт балун с такимже ранком и на том же адресе что и соновной
        }));

      //header:res.header,
      var res_converted = {markers:markers, results:results};

      main_dispatcher.fire.apply (main_dispatcher, [event_names.kPERSONAL_PAGE_MAP_LOADED].concat([res_converted]));

        response['status'] && main_dispatcher.fire.apply (main_dispatcher, [event_names.kPERSONAL_COMPANY_INFO_LOADED].concat([response['results']]));
        response['error'] && console.warn(response['error']);
    })
    .catch(e => console.error(e, e.stack));;
};

var user_shema = {
  email    : {
    required : true,
    format   : 'email',
    messages : {
      format : 'Не верный Email адрес'
    }
  },
  name : {
    required   : true,
    allowEmpty : false
  },
  comment     : {
    required   : true,
    allowEmpty : false
  },
  rating     : {
    required   : true,
    allowEmpty : false
  },
};



module.exports.submit_form = (comment, company_id, parent) => {
  var shema = {
    properties : user_shema,
  };

  main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_COMMENT_STATUS_RESET]);
  var validation = validator.validate(comment, shema);
  if (validation.valid) {
    resource(api_refs.kSUBMIT_COMMENT_DATA)
      .post({comment : comment, company_id : company_id, parent : parent})
      .then(response => {
        console.log(response);
        response['status'] && main_dispatcher.fire.apply (main_dispatcher, [event_names.kSUBMIT_COMMENT_SUCCESS].concat([response['results']]));
      })
      .catch(e => console.error(e, e.stack));
  }
  else {
    main_dispatcher.fire.apply(main_dispatcher, [event_names.kSUBMIT_COMMENT_STATUS_ERROR].concat([validation]));
  }
};
module.exports.submit_answer = (comment_id,comment) => {
    resource(api_refs.kSUBMIT_COMMENT_DATA)
      .post({comment : comment, comment_id : comment_id})
      .then(response => {
        response['status'] && main_dispatcher.fire.apply (main_dispatcher, [event_names.kSUBMIT_ANSWER_SUCCESS].concat([comment_id,response['results']]));
      });

};

var actions_ = [
  ['update_form', event_names.COMMENT_FORM_UPDATE]
];


/*var query_catalog_data = (type, brands, services, region_text) => {
  return r_catalog_data_
    .get({
      type: type==='_' ? '' : type,
      brands: brands==='_' ? '' : brands.join(','),
      services: services==='_' ? '': services.join(','),
      region_text: region_text})
    .then(res => {
      //console.log('res',res);
      if(_.isArray(res) && res.length === 0) {
        return {markers:[], results:[]};
      }
      //чистим данные с сервера
      var map_user_id = _.reduce(res.map, (memo,marker) => {
        memo[marker.user_id] = true;
        return memo;
      }, {});

      var res_user_id = _.reduce(res.results, (memo,marker) => {
        memo[marker.user_id] = true;
        return memo;
      }, {});

      var markers = _.filter(res.map, m => m.user_id in res_user_id);

      //fillial_type_id

      markers = _.map(markers, (m, m_index) =>
        _.extend( {
            is_open: false,         //true если с этой метки открыт balloon или надо открыть-закрыть балун
            show_phone: false,      //показывать ли телефон
            balloon_visible: false, //конкретно именно этот balloon открыт на экране,
                                    //в случае кластера может отличаться от is_open,
                                    //например открыли балун по одной метке и переместились стрелками в карусели кластер балуна на другой
                                    //наличие этого поля объясняется неимоверной хреновостью yandex map api
            on_current_page: false, //есть ли иконка на текущей старничке в табличке
          }, //system
          {
            marker_color: kCATALOG_MARKER_COLOR[m.filial_type_id - 1], //так как цвета маркера задаются в апи явно то вынужден писать их тут а не в css
            marker_type: kCATALOG_MARKER_TYPE[m.filial_type_id - 1],   //тип метки - автосервис или запчасть
            hint: kCATALOG_HINT[m.filial_type_id - 1] + m.company_name //хинт что показывать на метке
          }, //брать потом из базы
          {
            cluster_color: kCATALOG_CLUSTER_COLOR[m.filial_type_id - 1] //цвет иконки кластера
          },
          m,
          {
            server_id:m.id,    //настоящий id
            id: m.id + kCATALOG_DELTA_ID[m.filial_type_id - 1],          //смещенный id
            icon_number:m.rank //циферка на иконке
          } ));


      markers = _.sortBy(markers, m => m.rank);


      var results = _.filter(res.results, m => m.user_id in map_user_id);

      results = _.map(results, res => _.extend({},
        res,
        {
          is_hovered_same_rank: false,            //наведено на результат на карте или так
          is_hovered_same_address: false,         //наведено на результат и адрес совпадает с основным на карте или так
          is_balloon_visible_same_rank: false,    //открыт балун с таким же ранком
          is_balloon_visible_same_address: false  //открыт балун с такимже ранком и на том же адресе что и соновной
        }));

      //header:res.header,
      var res_converted = {markers:markers, results:results};

      //console.log('catalog res 2::: ', res_converted);
      //_.each(res_converted.results, r => console.log(r.id, r.rank, r.user_id));

      *//*
        code: "5c5845011qnvb"
        id: 2751411
        manufacturer: "vag"
        name: "стекло ветровое"
        rank: 1
        retail_price: "12750"
        stock: 1 //поле не забыть доставка 1;"В наличии", 2;"2-7 дней", 3;"7-14 дней", 4;"14-21 дня", 5;"до 31 дня"
        used: true
        user_id: 16405
        wholesale_price: null

      //на экране видим
        rank
        ближайший продавец
        manufacturer + code
        name
        stock + used
        retail_price
        телефон-заявка
      *//*

      return res_converted;
    });
};

var query_catalog_data_memoized = memoize(query_catalog_data, kMEMOIZE_OPTIONS);

module.exports.query_catalog_data = (type, brands, services, region_text) => {
  return serializer( () => query_catalog_data_memoized(type, brands, services, region_text)
      .then(res => {

        main_dispatcher.fire.apply (main_dispatcher, [event_names.kON_CATALOG_DATA_LOADED].concat([res]));
        return res;
      })
  )
    .catch(e => {
      if(promise_serializer.is_skip_error(e)) {
        //console.log('SKIPPED')
      } else {
        console.error(e, e.stack);
        throw e;
      }
    });
};*/

module.exports = _.extend({}, module.exports, action_export_helper(actions_));

