
module.exports = (function(){ //Hoare’s Selection Algorithm from Numerical Recipes in C: The Art of Scientific Computing
    var swap = function( array, i, j ) {
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    };

    return function( array, array_length, gt, k ) {
     var left = 0, right = array_length - 1;

      while( true ) {
        if( right <= left + 1 ) {
          if( right === left + 1 && gt(array[left] , array[right]) ) swap( array, left, right );
          
          return array.slice(0,Math.min(k,array_length));
        } else {
          var middle = ( left + right ) >>> 1;
          swap( array, middle, left + 1 );

          if( gt(array[ left ] , array[ right ]) ) swap( array, left, right );
          if( gt(array[ left + 1 ], array[ right ]) ) swap( array, left + 1, right );
          if( gt(array[ left ], array[ left + 1 ]) ) swap( array, left, left + 1 );

          var i = left + 1, j = right;
          var pivot = array[ i ];
          
          while( true ) {
            i++;
            while( gt(pivot, array[ i ]) ) i++;
            j--;
            while( gt(array[ j ], pivot)) j--;

            if( j < i ) break;
              swap(array, i, j);
          }
          array[left + 1] = array[j];
          array[j] = pivot;
          if( j >= k ) right = j - 1;
          if( j <= k ) left = i;
        }
      }
    };
  })();