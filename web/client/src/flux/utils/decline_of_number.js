'use strict';

//Склонение существительных по числительному
//Массив легко создавать провяряя числа 1, 3 и 5.
//Пример: decOfNum(5, ['секунда', 'секунды', 'секунд'])
module.exports = (number, titles) => {
    var cases = [2, 0, 1, 1, 1, 2];
    return number +" "+ titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
};

