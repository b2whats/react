'use strict';
var React = require('react/addons');
var Link = require('components/link.jsx');
var route_names = require('shared_constants/route_names.js');
var kDEFAULT_REGION_ID = 'sankt-peterburg';
var Menu = React.createClass({

    getInitialState: function(){
        return { focused: 0 };
    },

    clicked: function(index){

        // The click handler will update the state with
        // the index of the focused menu entry

        this.setState({focused: index});
    },

    render: function() {

        // Here we will read the items property, which was passed
        // as an attribute when the component was created

        var self = this;

        // The map method will loop over the array of menu entries,
        // and will return a new array with <li> elements.

        return (
            <div>
                <ul>{ this.props.items.map(function(m, index){

                    var style = '';

                    if(self.state.focused == index){
                        style = 'focused';
                    }

                    // Notice the use of the bind() method. It makes the
                    // index available to the clicked function:

                    return (
                    <li className={style} onClick={self.clicked.bind(self, index)}>
                        <Link
                            className="h_link"
                            href={route_names.kROUTE_ACCOUNT}
                            params={ {
                                region_id: kDEFAULT_REGION_ID,
                                section: m
                                } }>{m}</Link>

                    </li>);

                }) }

                </ul>

                <p>Selected: {this.props.items[this.state.focused]}</p>
            </div>
        );

    }
});

module.exports = Menu;
