'use strict';

//любой массив данных на вход или promise массива данных

//возвращает функцию которая на вход получает: 
//индексы массива данных среди которых будет выбор, 
//функцию ранжирования f(data)->number,
//и число K - сколько топ элементов возвратить

//полученная функция при вызове возвращает top k дата элементов

var q = require('ice_q');
var _ = require('lodash');
var qs = require('./quick_select.js');

//ограничение на размер массива индексов
var kMAX_INDEXES = 1000000;


//3 решение использовать предопределенный массив 
var qselect_topk = (function() {

  var arr_to_sort = _.map(_.range(0, kMAX_INDEXES), function(index) {
    return {index:index, order: 0};
  });

  return function (data, indexes, fn, k) {
    _.each(indexes, function(index, idx) {
      arr_to_sort[idx].index = index;
      arr_to_sort[idx].order = fn(data[index]);
    });

    
    //console.time('st');
    var res = qs(arr_to_sort, indexes.length, function(a,b){
      
      if(a.order === b.order) {
        return a.index < b.index;
      }

      return a.order<b.order;
    }, k);


    res = _.sortBy(res, function(v){return -v.order;});
    //а теперь нормальный comaprator
    res.sort(function(a,b){
      
      if(a.order === b.order) {
        return a.index - b.index;
      }

      return b.order - a.order;
    });


    //console.timeEnd('st');
    res = _.map(res, function(r) {
      return data[r.index];
    });
    return res;
  };
})();


//---------------------------------EXPORTS------------------------------------------------------------------------------------

module.exports = function(data_arr_or_promise) {  
  //return init(poi_aspect_file, options)
  return q(data_arr_or_promise)
  .then(function(data) {
    //на вход массив индексов данных среди которых выбирать, функция выбора, и кол-во элементов
    return function (data_indexes, fn, k) {      
      return qselect_topk(data, data_indexes, fn, k);
    };    
  });
};





//------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------
//-----------------------------TESTS--------------------------------------------------------------------------------------------

if (!module.parent) {
  
  //схема данных для лоадера  
  var data_schema = {
    index:[0, 'number'],
    rid:[1,'number'],
    name:[2,'string'], 
    country:[3,'string'],
    lat:[4,'number'], 
    lng:[5,'number'],
    review_length: [6, 'number'], 
    aspect_data: [7, 'json']

  };
  var data_loader = require('./ice_data_loader.js');
  
  module.exports(data_loader(__dirname + '/../../../../../data/hotels/poi_data.txt', { d: '~', schema: data_schema}))
  .then(function(top_k_fn) {
    //Тут генерим функцию поиска по алгоритму ранжирования        
    return function(data_indexes, aspect_indexes, k) {
      return top_k_fn( 
        data_indexes,
        //алгоритм ранжирования
        function(data) { 
          var sum = 0;
          for(var i=0;i!=aspect_indexes.length;++i) {
            sum+=data.aspect_data[ aspect_indexes[i] ];
          }
          return sum;
        }, 
        
        k);
    };
  })
  .then(function(top_k_aspect_poi_fn) {

    var aspect_indexes = [5,20,70, 100];
    var idx = 0;
    var data_indexes = _.range(0+idx*1000, 10000+idx*1000);

    console.time('b');      
      var res = top_k_aspect_poi_fn(data_indexes, aspect_indexes, 10);      
    console.timeEnd('b');

    console.log(res);

  })
  .catch(function(e){
    console.error(e);
  });

}














