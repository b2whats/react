'use strict';

module.exports.money = (int, delim) => {
  return int.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1"+delim)
};

