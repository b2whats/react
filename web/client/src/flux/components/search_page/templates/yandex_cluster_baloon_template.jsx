'use strict';
var _ = require('underscore');
var dom_helper = require('utils/dom_helper.js');
var yandex_templates_events = require('./yandex_templates_events.js');
var Link = require('components/link.jsx');
module.exports = (ymaps, on_balloon_event) => {
    var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div class="yandex-map-balloon yandex-map-balloon-cluster {{properties.marker_type}}">' +
        '<div id="yandex-map-balloon-close-button" class="yandex-map-balloon-close-button"></div> ' +
        '<div class="yandex-map-balloon-title">' +         
          '<i class="svg-icon_placemark-{{properties.marker_type}}"></i>' +         
          '<span>Метка №{{properties.rank}}</span>' +
        '</div> ' +        
        '<div id="yandex-map-balloon-company-name" class="yandex-map-balloon-company-name cur-p td-u">{{properties.company_name}}</div>' +
        '<div class="yandex-map-balloon-address">{{properties.address}}</div>' +
        '<div class="yandex-map-balloon-footer">' +
          '<div class="yandex-map-balloon-footer-left">' +
            '<div class="yandex-map-balloon-footer-time-header">' +
              'Время работы:'+
            '</div>' +


              '<div class="yandex-map-balloon-footer-time-line">' +
                '<div class="yandex-map-balloon-footer-time-line-date">Пн-Пт</div>'+
                '{% if properties.operation_time[0]["is_holiday"] %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>'+
                '{% else %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[0].from}} - {{properties.operation_time[0].to}}</div>'+
                '{% endif %}' +
              '</div>' +
              '<div class="yandex-map-balloon-footer-time-line">' +
                '<div class="yandex-map-balloon-footer-time-line-date">Сб</div>'+
                '{% if properties.operation_time[1]["is_holiday"] %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>'+
                '{% else %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[1].from}} - {{properties.operation_time[1].to}}</div>'+
                '{% endif %}' +
              '</div>' +
              '<div class="yandex-map-balloon-footer-time-line">' +
                '<div class="yandex-map-balloon-footer-time-line-date">Вс</div>'+
                '{% if properties.operation_time[2]["is_holiday"] %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">Выходной</div>'+
                '{% else %}' +
                  '<div class="yandex-map-balloon-footer-time-line-value">{{properties.operation_time[2].from}} - {{properties.operation_time[2].to}}</div>'+
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
        '<div id="yandex-map-balloon-close-button" class="yandex-map-balloon-close-button"></div> ' + //пока оставлю вдруг пригадица
        '<div class="yandex-map-balloon-title">{{properties.company_name}}</div> ' +
        '<div class="yandex-map-balloon-address">{{properties.address}}</div>' +
        '{% if properties.show_phone %}' +
          '<div class="yandex-map-balloon-phone-text">{{properties.phone}}</div>' +
        '{% else %}' + 
          '<div><button id="yandex-map-balloon-phone-button" class="yandex-map-balloon-phone-button">Показать телефон</button></div>' + 
        '{% endif %}' + 
        */
    '</div>', {

    build () {
      on_balloon_event(yandex_templates_events.kON_BALLOON_VISIBLE, this.getData().geoObject.id, this.getData().geoObject.properties);

      BalloonContentLayout.superclass.build.call(this);      
      var button_phone = dom_helper.query_selector('#yandex-map-balloon-phone-button', this.getParentElement());

      if(button_phone) {
        this.click_fn = _.bind(this.click, this);
        dom_helper.subscribe(button_phone, 'click', this.click_fn);
      }

      var close_button = dom_helper.query_selector('#yandex-map-balloon-close-button', this.getParentElement());
      this.close_click_fn = _.bind(this.close_click, this);
      dom_helper.subscribe(close_button, 'click', this.close_click_fn);

      var goto = dom_helper.query_selector('#yandex-map-balloon-company-name', this.getParentElement());
      this.goto_company_page_fn = _.bind(this.goto_company_page, this);
      dom_helper.subscribe(goto, 'click', this.goto_company_page_fn);
    },

    close_click(e) {
      on_balloon_event(yandex_templates_events.kON_CLOSE_CLICK, this.getData().geoObject.id, this.getData().geoObject.properties);
    },

    click(e) {
      on_balloon_event(yandex_templates_events.kON_SHOW_PHONE_CLICK, this.getData().geoObject.id, this.getData().geoObject.properties);
    },
    goto_company_page(e) {
      on_balloon_event(yandex_templates_events.kON_GOTO_COMPANY_PAGE, this.getData().geoObject.id, this.getData().geoObject.properties);
    },
    clear () {
      on_balloon_event(yandex_templates_events.kON_BALLOON_HIDDEN, this.getData().geoObject.id, this.getData().geoObject.properties);

      var button_phone = dom_helper.query_selector('#yandex-map-balloon-phone-button');      
      if(button_phone)
        dom_helper.unsubscribe(button_phone, 'click', this.click_fn);

      var close_button = dom_helper.query_selector('#yandex-map-balloon-close-button', this.getParentElement());
      dom_helper.unsubscribe(close_button, 'click', this.close_click_fn);

      var goto = dom_helper.query_selector('#yandex-map-balloon-company-name', this.getParentElement());
      dom_helper.unsubscribe(goto, 'click', this.goto_company_page_fn);

      BalloonContentLayout.superclass.clear.call(this)

    }
  });
  return BalloonContentLayout;  
};
