'use strict';

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

/* jshint ignore:start */
var Link = require('components/link.jsx');
var RegionSelector = require('./region_selector.jsx');
/* jshint ignore:end */
var Modal = require('components/modal/index');
var appElement = document.getElementById('react_main');

Modal.setAppElement(appElement);
Modal.injectCSS();
var modal_actions = require('actions/modal_actions.js');


var modal_store = require('stores/modal_store.js');
var Header = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function() {
    return { modalIsOpen: true };
  },
  openModal: function() {
    console.log('hendler');
    modal_actions.open_modal();
  },

  closeModal: function() {
    modal_actions.close_modal();
  },
  handleModalCloseRequest: function() {
    modal_actions.close_modal();
  },
  render () {
    return (
      <div className="hfm-wrapper main-header header entire-width">
        
        <RegionSelector />

        <div className="top-navbar">
          <Link className="h_link" href="/">Каталог компаний</Link>
          <Link className="no-href">|</Link>
          <Link className="ap-link" href="/">Регистрация</Link>
          <Link className="ap-link" onClick={this.openModal}>Вход</Link>
          <Modal
              isOpen={this.state.modalIsOpen}
              onRequestClose={this.handleModalCloseRequest}
          >
            <h1>Hello {console.log(this.state.modalIsOpen)} 1</h1>
            <button onClick={this.closeModal}>close</button>
          </Modal>
        </div>
      </div>
    );
  }
});

module.exports = Header;
