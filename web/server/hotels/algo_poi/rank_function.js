
//функции ранжирования это f(user_options, data) -> number
//в данном случае генерим функцию g(data) = f(user_options, data) (user_options) (каррирование аргументов)


//1 получает на вход индексы аспектов - возвращает функцию которая складывает оценки по выбранным аспектам
module.exports = function(aspect_indexes) {
  return function(data) { 
    var sum = 0;
    for(var i=0;i!=aspect_indexes.length;++i) {
      sum+=data.aspect_data[ aspect_indexes[i] ];
    }
    return sum;
  };
};
