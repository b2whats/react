'use strict';
var _ = require('underscore');
var dom_helper = require('utils/dom_helper.js');

module.exports = (ymaps, on_balloon_event) => {
    var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="yandex-map-balloon">' +
        '<div id="yandex-map-balloon-close-button" class="yandex-map-balloon-close-button"></div> ' + //пока оставлю вдруг пригадица
        '<div class="yandex-map-balloon-title">{{properties.company_name}}</div> ' +
        '<div class="yandex-map-balloon-address">{{properties.address}}</div>' +
        '{% if properties.show_phone %}' +
          '<div class="yandex-map-balloon-phone-text">{{properties.phone}}</div>' +
        '{% else %}' + 
          '<div><button id="yandex-map-balloon-phone-button" class="yandex-map-balloon-phone-button">Показать телефон</button></div>' + 
        '{% endif %}' +        
    '</div>', {

    build () {
      BalloonContentLayout.superclass.build.call(this);      
      var button_phone = dom_helper.query_selector('#yandex-map-balloon-phone-button', this.getParentElement());

      if(button_phone) {
        this.click_fn = _.bind(this.click, this);
        dom_helper.subscribe(button_phone, 'click', this.click_fn);
      }

      var close_button = dom_helper.query_selector('#yandex-map-balloon-close-button', this.getParentElement());
      this.close_click_fn = _.bind(this.close_click, this);
      dom_helper.subscribe(close_button, 'click', this.close_click_fn);
    },

    close_click(e) {
      console.log(this.getData());
      on_balloon_event('CLOSE_CLICK', this.getData().geoObject.id, this.getData().geoObject.properties);
    },

    click(e) {
      console.log(this.getData());
      on_balloon_event('SHOW_PHONE_CLICK', this.getData().geoObject.id, this.getData().geoObject.properties);
    },

    clear () {      
      var button_phone = dom_helper.query_selector('#yandex-map-balloon-phone-button');      
      if(button_phone)
        dom_helper.unsubscribe(button_phone, 'click', this.click_fn);

      var close_button = dom_helper.query_selector('#yandex-map-balloon-close-button', this.getParentElement());
      dom_helper.unsubscribe(close_button, 'click', this.close_click_fn);

      BalloonContentLayout.superclass.clear.call(this)

    }
  });
  return BalloonContentLayout;  
};
