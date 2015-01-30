'use strict';
var React = require('react/addons');
var Link = require('components/link.jsx');
var route_names = require('shared_constants/route_names.js');

var Menu = React.createClass({
    getDefaultProps: function() {
        return {
            listClassName: '',
            focused: ''
        }
    },

    render: function() {
        var self = this;
        return (
                <ul className={this.props.className}>
                    { this.props.items.map(function(element, index){
                        var classes = React.addons.classSet({
                            'focused' : self.props.focused == element.id
                        });

                        return (
                        <li key={index} className={classes}>
                            <Link
                                className={self.props.listClassName}
                                href= {"/account/:region_id/"+element.id}>
                                {element.name}
                            </Link>
                        </li>);
                    }) }
                </ul>
        );

    }
});

module.exports = Menu;
