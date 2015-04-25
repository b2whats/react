'use strict';

var immutable = require('immutable');

//сравнит два массива
function keep_position_merge (a_prev, aprev_key, a_new, a_new_key, unreplaceable_key, o_callback) {
  if(a_new.length > a_prev.length) throw new Error('метод не работает если размер нового вектора больше существующего');
  //a_new_keys.map
  var a_prev_keys = a_prev
    .map(a_p => a_p.get(aprev_key));

  var a_prev_unreplaceable_keys = a_prev
    .filter(a_p => a_p.get(unreplaceable_key) === true)
    .map(a_p => a_p.get(aprev_key));

  var a_new_keys = a_new.map(a_p => a_p.get(a_new_key));

  var new_key_2_index = a_new_keys
    .reduce((memo, v, index) => memo.set(v, index), immutable.Map());

  var intrsect = immutable.Set.from(a_new_keys).intersect(a_prev_keys);
  var diff = immutable.Set.from(a_new_keys).subtract(a_prev_keys);
  var unrepl = immutable.Set.from(a_prev_unreplaceable_keys);

  var diff_iterator = diff.values();
  
  var it;
  
  return a_prev_keys.map((prev_val, index_prev) => {
    if(intrsect.has(prev_val)) {
      return o_callback.update(a_prev.get(index_prev), a_new.get(new_key_2_index.get(prev_val)));
    } else {
      
      if(unrepl.has(prev_val)) {
        return o_callback.touch(a_prev.get(index_prev));
      } else {
        it = diff_iterator.next();
        if(it.done) {
          return o_callback.remove(a_prev.get(index_prev));
        } else {
          return o_callback.replace(a_prev.get(index_prev), a_new.get(new_key_2_index.get(it.value)));
        }
      }    
    }
  });
}

module.exports = keep_position_merge;

/*
keep_position_merge(immutable.fromJS([{k:0, v:0}, {k:1, v:1}, {k:2, v:2}, {k:3, v:3}, {k:4, v:4}]),   'k', 
                    immutable.fromJS([{kk:3, v:3}, {kk:4, v:4}, {kk:5, v:5}, {kk:6, v:6}]), 'kk', {
  update: function(index_prev, index_new) {
    console.log('update',index_prev, index_new);
  },
  replace: function(index_prev, index_new) {
    console.log('replace',index_prev, index_new);
  },
  remove: function(index_prev) {
    console.log('remove',index_prev);
  }
}).toVector();
*/