import React, {Component, PropTypes} from 'react/addons';
require('pointfree-fantasy').expose(global);
import Maybe from 'pointfree-fantasy/instances/maybe';
//debugger;
var toUpperCase = function(y) { return y + y; };

const t = Maybe(null);

let a = 1;
let bar = 2;

let b = {...a, foo: bar};


//console.log(map(map(toUpperCase), Maybe([1,2,3])));// eslint-disable-line no-console
export default class Payment extends Component {
  render() {
    return (
      <div>
        test
      </div>
    );
  }
}


