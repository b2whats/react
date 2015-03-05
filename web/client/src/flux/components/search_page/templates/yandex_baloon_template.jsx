'use strict';
var _ = require('underscore');
var dom_helper = require('utils/dom_helper.js');
var yandex_templates_events = require('./yandex_templates_events.js');

module.exports = (ymaps, on_balloon_event) => {
    var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="yandex-map-balloon {{properties.marker_type}}">' +
        '<div id="yandex-map-balloon-close-button" class="yandex-map-balloon-close-button"></div> ' +
        '<div class="yandex-map-balloon-title">' +         
          '<i class="svg-icon_placemark-{{properties.marker_type}}"></i>' +         
          '<span>Метка №{{properties.rank}}</span>' +
        '</div> ' +        
        '<div class="yandex-map-balloon-company-name">{{properties.company_name}}</div>' + 
        '<div class="yandex-map-balloon-address">{{properties.address}}</div>' +
        '<div class="yandex-map-balloon-footer">' +
          '<div class="yandex-map-balloon-footer-left">' +
            '<div class="yandex-map-balloon-footer-time-header">' +
              'Время работы:'+
            '</div>' +

            '<div class="yandex-map-balloon-footer-time-line">' +
            '<div class="yandex-map-balloon-footer-time-line-date">Пн-Пт</div>' +
            '{% if properties.operation_time[0]["is_holiday"] %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>' +
            '{% else %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[0].from}} - {{properties.operation_time[0].to}}</div>' +
            '{% endif %}' +
            '</div>' +
            '<div class="yandex-map-balloon-footer-time-line">' +
            '<div class="yandex-map-balloon-footer-time-line-date">Сб</div>' +
            '{% if properties.operation_time[1]["is_holiday"] %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>' +
            '{% else %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[1].from}} - {{properties.operation_time[1].to}}</div>' +
            '{% endif %}' +
            '</div>' +
            '<div class="yandex-map-balloon-footer-time-line">' +
            '<div class="yandex-map-balloon-footer-time-line-date">Вс</div>' +
            '{% if properties.operation_time[2]["is_holiday"] %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>' +
            '{% else %}' +
            '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[2].from}} - {{properties.operation_time[2].to}}</div>' +
            '{% endif %}' +
            '</div>' +

          '</div>' +
          '<div class="yandex-map-balloon-footer-right">' +
            '<div class="yandex-map-balloon-footer-time-header">' +
              'Телефоны:'+
            '</div>' +
            '{% for phone in properties.filial_phones %}' +
              '<div class="yandex-map-balloon-footer-phone-line">' +
                '{{phone}}' +
              '</div>' +
            '{% endfor %}' +
          '</div>' +
        '</div>' +
        

        /*
        '{% if properties.show_phone %}' +
          '<div class="yandex-map-balloon-phone-text">{{properties.phone}}</div>' +
        '{% else %}' + 
          '<div><button id="yandex-map-balloon-phone-button" class="yandex-map-balloon-phone-button">Показать телефон</button></div>' + 
        '{% endif %}' +        
        */
    '</div>', {

    build () {
      on_balloon_event(yandex_templates_events.kON_BALLOON_VISIBLE, this.getData().object.id, this.getData().properties.getAll());

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
      on_balloon_event(yandex_templates_events.kON_CLOSE_CLICK, this.getData().object.id, this.getData().properties.getAll());
    },

    click(e) {
      on_balloon_event(yandex_templates_events.kON_SHOW_PHONE_CLICK, this.getData().object.id, this.getData().properties.getAll());
    },

    clear () {
      on_balloon_event(yandex_templates_events.kON_BALLOON_HIDDEN, this.getData().object.id, this.getData().properties.getAll());
      
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
