import {K_SCALE_NORMAL} from 'components/markers/map_marker.jsx';
import invariant from 'fixed-data-table-ice/internal/invariant.js';

// {l: 10, scale: 0.3}, {l: 5, scale: 0.4} - означает
// 10 элементов размера 0.3, потом 5 размера 0.4, потом те что видны в табличке обычного размера
// потом снова потом 5 размера 0.4, и 10 элементов размера 0.3
// если поставить пусто то на карте будут видны тока те что на экране
const K_SCALE_SMALL = 0.25;
const K_SCALE_MEDIUM = 0.4;
const K_BEFORE_AFTER_SCALES = [{l: 15, scale: K_SCALE_SMALL}, {l: 10, scale: K_SCALE_MEDIUM}];
const K_SCALES_SUM = K_BEFORE_AFTER_SCALES.reduce((sum, el) => el.l + sum, 0);


export function getScale(rowIndex, rowFrom, rowTo) {
  if (rowIndex >= rowFrom && rowIndex <= rowTo) {
    return K_SCALE_NORMAL;
  }

  if (K_BEFORE_AFTER_SCALES.length) {
    if (rowIndex < rowFrom) {
      let deltaS = rowFrom;
      for (let index = K_BEFORE_AFTER_SCALES.length - 1; index >= 0; --index) {
        deltaS -= K_BEFORE_AFTER_SCALES[index].l;
        if (rowIndex >= deltaS) {
          return K_BEFORE_AFTER_SCALES[index].scale;
        }
      }

      // перебор возможен так задумано
      return K_BEFORE_AFTER_SCALES[0].scale;
    }

    if (rowIndex > rowTo) {
      let deltaS = rowTo;
      for (let index = K_BEFORE_AFTER_SCALES.length - 1; index >= 0; --index) {
        deltaS += K_BEFORE_AFTER_SCALES[index].l;
        if (rowIndex <= deltaS) {
          return K_BEFORE_AFTER_SCALES[index].scale;
        }
      }

      // перебор возможен так задумано
      return K_BEFORE_AFTER_SCALES[0].scale;
    }
  }

  invariant(!K_BEFORE_AFTER_SCALES.length, 'и сюда попадать грех');

  return K_SCALE_NORMAL;
}

export function getRealFromTo(rowFrom, rowTo, totalSize) {
  let addFrom = ((rowTo + K_SCALES_SUM) > (totalSize - 1)) ? ((rowTo + K_SCALES_SUM) - (totalSize - 1)) : 0;
  let addTo = rowFrom - K_SCALES_SUM < 0 ? K_SCALES_SUM - rowFrom : 0;


  return {
    rowFrom: Math.max(0, rowFrom - K_SCALES_SUM - addFrom),
    // так как на экране может быть одновременно разное число видимых айтемов
    // то округление правого края до 2 необходимо иначе получим мигающую иконку
    rowTo: Math.min(totalSize - 1, Math.round((rowTo + K_SCALES_SUM + addTo) / 2) * 2 + 1)
  };
}
