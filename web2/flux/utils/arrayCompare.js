function sortFunction(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  // в случае а = b вернуть 0
  return 0;
}
export default function arrayCompare(arr1, arr2) {
  arr1.sort(sortFunction);
  arr2.sort(sortFunction);
  return arr1.join(',') === arr2.join(',');
}
