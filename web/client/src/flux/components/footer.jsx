'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
/* jshint ignore:end */

var Footer = React.createClass({
  mixins: [PureRenderMixin],
  
  render () {
    return (
      <div className="footer main-footer">
        <div className="hfm-wrapper entire-width">
          <span>
            <span className="copyright">© 2013-2014 AutoGiper.ru</span>
            <Link className="h_link" href="#">Информационная поддержка</Link>
            <Link className="h_link" href="#">Пользовательское соглашение</Link>
            <Link className="h_link" href="#">Контакты</Link>
          </span>
          <span>  
            Мы в соц. сетях :
            <Link className="icon-link" href="#"><i className="icon-facebook-rect"></i></Link>
            <Link className="icon-link" href="#"><i className="icon-vkontakte-rect"></i></Link>
          </span>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
