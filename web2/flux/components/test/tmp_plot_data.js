'use strict';
var immutable = require('immutable');

module.exports = immutable.fromJS([
  {
    class_name: "my-line-classname",
    description: "Количество кликов",
    data:[0.15, 0.55, 0.59, 0.9, 0.35, 0.9],
    info:[
      {date: '2014-11-01', value: 1},
      {date: '2014-11-02', value: 3},
      {date: '2014-11-03', value: 6},
      {date: '2014-11-04', value: 3},
      {date: '2014-11-05', value: 4},
      {date: '2014-11-06', value: 4},
    ]
  },
]);
