'use strict';
var _ = require('underscore');

var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;
var cx        = React.addons.classSet;

var kPAGES_ON_SCREEN = 3;

var Header = React.createClass({
  mixins: [PureRenderMixin],
  
  on_click (page_num, is_disabled, e) {
    if(!is_disabled)
      this.props.on_click(page_num);

    e.preventDefault();
    e.stopPropagation();
  },

  render () {
    var page_num = this.props.page_num;
    var results_count = this.props.results_count;
    var items_per_page = this.props.items_per_page;
    if(!results_count) return null;

    var pages_on_screen = this.props.pages_on_screen || kPAGES_ON_SCREEN;

    var total_pages = Math.ceil(results_count / items_per_page);
    //от скольки до скольки показывать
    var start_page_num = pages_on_screen*Math.floor(page_num / pages_on_screen);
    var end_page_num = Math.min(start_page_num + pages_on_screen, total_pages);
    
    var page_values_array = _.map(_.range(start_page_num, end_page_num), val => ({value: val, visual: val+1, class_name:{disabled: false, 'cur-p' : true}}));
    
/*    page_values_array.splice(0,0, {value: start_page_num - 1, visual:'...', class_name:{disabled: true}});
    page_values_array.push({value:end_page_num, visual:'...', class_name:{disabled: true}})*/

    if(start_page_num > 0) page_values_array[0].class_name.disabled = false;
    if(end_page_num < total_pages) page_values_array[page_values_array.length-1].class_name.disabled = false;

    //page_values_array.splice(0,0, {value: page_num - 1, visual:'<', class_name:{disabled: true}});
    page_values_array.push({value:page_num - 1, visual:'<i class="flaticon-left"></i>', class_name:{disabled: true, 'arrow left grad-g' : true}})
    page_values_array.push({value:page_num + 1, visual:'<i class="flaticon-right"></i>', class_name:{disabled: true, 'arrow right grad-g' : true}})

    if(page_num > 0) page_values_array[page_values_array.length - 2].class_name.disabled = false;
    if(page_num < total_pages-1) page_values_array[page_values_array.length-1].class_name.disabled = false;

    var pagenums = _.map(page_values_array, (v, index) => 
      <a  onClick={_.bind(this.on_click, this, v.value, v.class_name.disabled)}
          className={cx(cx(v.class_name), v.value===page_num ? 'active' : null)}
          
          key={index}
        dangerouslySetInnerHTML={{__html: v.visual}}>

      </a>);

    return (
      <span className={this.props.className || "pagination"}>
        {pagenums}
      </span> 
    );
  }
});

module.exports = Header;
