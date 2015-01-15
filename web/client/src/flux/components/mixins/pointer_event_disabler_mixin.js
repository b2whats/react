'use strict';

var dom_helper = require('utils/dom_helper.js');

var kPOINTER_EVENTS_PREVENT_TIME = 100; //на длинных списках может не хватить - надо на максимальной длине потестить и увеличить
var kSMALL_DELTA = 10;

var kCLASS_DISABLED = 'disable-pointer-events';

module.exports = {

  componentWillMount() {
    this._prevent_scroll_to_focused_time_mixin_ = 0;
    this._pointer_events_timer_started_mixin_ = false;
    this._dom_node_mixin_ = null;
  },

  componentDidMount() {
    console.log(this);
    this._dom_node_mixin_ = this.getDOMNode(); //dom_helper.query_selector('body');
    dom_helper.subscribe_w_capture(this._dom_node_mixin_, 'wheel', this.on_wheel);
  },

  componentWillUnmount() {
    if(this._dom_node_mixin_) {
      dom_helper.unsubscribe(this._dom_node_mixin_, 'wheel', this.on_wheel);
      this._dom_node_mixin_ = null;
    }
  },
  

  pointer_events_guard() {
    if((new Date()).getTime() - this._prevent_scroll_to_focused_time_mixin_ > kPOINTER_EVENTS_PREVENT_TIME) {
      this._pointer_events_timer_started_mixin_ = false;
      
      dom_helper.remove_class(this._dom_node_mixin_, kCLASS_DISABLED);
      //теперь небольшой хак подвинуть вверх вниз элемент со скролом
      //offsetHeight
      //scrollHeight
      var node = this._dom_node_mixin_;
      while(node!==null && node.scrollHeight<=node.clientHeight) {
        node = node.parentNode;
      }
      if (node) {
        node.scrollTop = node.scrollTop + 1;
        node.scrollTop = node.scrollTop - 1;
      }
    } else {
      //рестартануть
      setTimeout(this.pointer_events_guard, kPOINTER_EVENTS_PREVENT_TIME - ((new Date()).getTime() - this._prevent_scroll_to_focused_time_mixin_) + kSMALL_DELTA);
    }
  },

  on_wheel() {
    this._prevent_scroll_to_focused_time_mixin_ = (new Date()).getTime();
    if(!this._pointer_events_timer_started_mixin_) {
      dom_helper.add_class(this._dom_node_mixin_, kCLASS_DISABLED);

      setTimeout(this.pointer_events_guard, kPOINTER_EVENTS_PREVENT_TIME + kSMALL_DELTA);
      this._pointer_events_timer_started_mixin_ = true;
    }
  }

};
