/**
 * @jsx React.DOM
 */
'use strict';

var React     = require('react/addons');
var PropTypes = React.PropTypes;
var cx        = React.addons.classSet;
var raf = require('utils/raf.js');
var style_utils = require('utils/style_utils.js');
var _ = require('underscore');
var text_utils = require('utils/text.js');

var Typeahead = React.createClass({

  focused_can_change: true,

  propTypes: {
    options: PropTypes.any,
    search: PropTypes.func,
    resultRenderer: PropTypes.oneOfType([
      PropTypes.component,
      PropTypes.func
    ]),
    value: PropTypes.object,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    has_custom_scroll: PropTypes.bool,
    columns: PropTypes.number,
    column_title_idx: PropTypes.number,
    column_headers: PropTypes.arrayOf(PropTypes.string)
  },

  render() {
    var className = cx(
      this.props.className,
      'input-group', 
      'input-group-sm',
      'typeahead-holder',
      this.state.showResults ?
        'show-results' :
        undefined
    );
    var style = {
      position: 'relative',
      outline: 'none'
    };

    return (
      <div
        tabIndex="1"
        className={className}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        style={style}>
        <input
          ref="search"
          type="text"
          className="form-control typeahead-input"
          placeholder={this.props.placeholder}
          style={ this.props.style }
          onClick={this.showAllResults}
          onChange={this.onQueryChange}
          onFocus={this.showAllResults}
          onBlur={this.onQueryBlur}
          onKeyDown={this.onQueryKeyDown}
          value={this.state.searchTerm} />

        
        <TypeaheadResults          
          onSelect={this.onValueChange}
          onFocus={this.onValueFocus}
          results={this.state.results}
          focusedValue={this.state.focusedValue}
          show={this.state.showResults}
          renderer={this.props.resultRenderer}
          has_custom_scroll={!!this.props.has_custom_scroll}
          on_disable_focused_value={this.on_disable_focused_value}
          on_enable_focused_value={this.on_enable_focused_value}
          on_move_up={this.on_move_up}
          on_move_down={this.on_move_down}
          list_width={this.props.list_width}
          columns={this.props.columns}
          column_title_idx={this.props.column_title_idx} 
          column_headers={this.props.column_headers} 
          search_term={this.state.searchTerm}/>
      </div>
    );
  },



  on_disable_focused_value() {
    this.focused_can_change = false;
    this.setState({
      focusedValue: null
    });
  },

  on_enable_focused_value() {
    this.focused_can_change = true;
  },

  on_move_up() {
    var prevIdx = Math.max(
      this.focusedValueIndex() - 1,
      0
    );
    this.setState({
      focusedValue: this.state.results[prevIdx]
    });
  },

  on_move_down() {
    var nextIdx = Math.min(
      this.focusedValueIndex() + (this.state.showResults ? 1 : 0),
      this.state.results.length - 1
    );
    this.setState({
      showResults: true,
      focusedValue: this.state.results[nextIdx]
    });    
  },


  getDefaultProps() {
    return {
      search: searchArray,
      column_title_idx: 0
    };
  },

  getInitialState() {
    return {
      results: [],
      showResults: false,
      showResultsInProgress: false,
      searchTerm: this.getSearchTerm(this.props),
      focusedValue: null
    };
  },


  componentWillReceiveProps(next_props) {
    if(next_props.show_value) {
      var prev_index = this.props.show_value && this.props.show_value.index || 0;
      var new_index = next_props.show_value.index;
      if(prev_index != new_index) {
        this.setState({
          searchTerm: next_props.show_value.search_term,
          showResults: false
        });
        raf(() => {
          this.onFocus();
          this.showAllResults();
        }, null);
      }
    }


    if(next_props.initial_value && this.props.initial_value !== next_props.initial_value) {
      this.setState({
        searchTerm: next_props.initial_value,
        showResults: false
      });
    }
  },

  componentWillMount() {
    this.blurTimer = null;
    if(this.props.initial_value) {
      this.setState({
        searchTerm: this.props.initial_value,
        showResults: false
      });
    }    
  },

  get_title_value(title) {
    if(this.props.columns && this.props.columns>0) {
      return title[this.props.column_title_idx];
    }
    return title;
  },

  getSearchTerm(props) {
    var searchTerm;
    if (props.searchTerm) {
      searchTerm = props.searchTerm;
    } else if (props.value) {
      var {id, title} = props.value;
      if (title) {

        searchTerm = this.get_title_value(title);
      
      } else if (id) {
        props.options.forEach((opt) => {
          if (opt.id == id) {            
            searchTerm = this.get_title_value(opt.title);
          }
        });
      }
    }
    return searchTerm || '';
  },

  /**
    * Show results for a search term value.
    *
    * This method doesn't update search term value itself.
    *
    * @param {Search} searchTerm
    */
  showResults(searchTerm) {
    this.setState({showResultsInProgress: true});
    this.props.search(
      this.props.options,
      searchTerm.trim(),
      this.onSearchComplete
    );
  },

  showAllResults() {
    //console.log('this.getSearchTerm(this.props)', this.state.searchTerm);
    //this.showResults(searchTerm);
    
    //Какая то была бага свзяанная с этой строчкой, пока верну
    if (!this.state.showResultsInProgress && !this.state.showResults) {
      this.showResults(this.state.searchTerm);
    }
  },

  onValueChange(value) {
    var state = {
      value: value,
      showResults: false
    };

    if (value) {
      var term = text_utils.remove_tags(this.get_title_value(value.title));
      state.searchTerm = term;//value.title;
    }
    
    raf(() => {
      this.setState(state);
    }, null, this.constructor.displayName);

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },

  onSearchComplete(err, results, searchTerm) {
    if (err) {
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    }

    raf(() => {
      this.setState({
        showResultsInProgress: false,
        showResults: true,
        results: results
      });
    }, null, this.constructor.displayName);

  },

  onValueFocus(value) {
    this.setState({focusedValue: value});
  },



  onQueryChange(e) {
    var searchTerm = e.target.value;
    
    this.setState({
      searchTerm: searchTerm,
      focusedValue: null
    });

    this.showResults(searchTerm);
  },

  onFocus() {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
    this.refs.search.getDOMNode().focus();
  },

  onBlur(e) {
    var self = this;
    // wrap in setTimeout so we can catch a click on results
    this.blurTimer = setTimeout(() => {
      if (this.isMounted()) {
        //console.log('blur-blur-blur');
        if(self.props.on_blur) {
          self.props.on_blur();
        }

        this.setState({showResults: false});
      }
    }, 100);
  },

  onQueryBlur (e) {
    //console.log('onQueryBlur', _.extend({}, e));
  },

  onQueryKeyDown(e) {

    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.focusedValue) {
        this.onValueChange(this.state.focusedValue);
      }
    } else if (e.key === 'ArrowUp' && this.state.showResults) {
      e.preventDefault();
      var prevIdx = Math.max(
        this.focusedValueIndex() - 1,
        0
      );
      this.setState({
        focusedValue: this.state.results[prevIdx]
      });

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.state.showResults) {
        var nextIdx = Math.min(
          this.focusedValueIndex() + (this.state.showResults ? 1 : 0),
          this.state.results.length - 1
        );
        this.setState({
          showResults: true,
          focusedValue: this.state.results[nextIdx]
        });
      } else {
        this.showAllResults();
      }
    }
  },

  focusedValueIndex() {
    if (!this.state.focusedValue) {
      return -1;
    }
    for (var i = 0, len = this.state.results.length; i < len; i++) {
      if (this.state.results[i].id === this.state.focusedValue.id) {
        return i;
      }
    }
    return -1;
  }
});


//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
var kPREVENT_TIME = 300; //на длинных списках может не хватить - надо на максимальной длине потестить и увеличить
var kPOINTER_EVENTS_PREVENT_TIME = 100; //на длинных списках может не хватить - надо на максимальной длине потестить и увеличить
var kSMALL_DELTA = 10;


var TypeaheadResults = React.createClass({

  prevent_scroll_2_focused_time: 0,
  pointer_events_timer_started: false,
  
  //is_scroll_thumb_in_drag_mode: false,
  scroll_thumb_mouse_y_start: null,
  scroll_thumb_scroll_top_pos: null,


  is_visible(props) {
    return props && props.show && props.results && props.results.length>0;
  },

  render() {

    


    var style = {
      display: this.is_visible(this.props) ? 'block' : 'none',
      listStyleType: 'none'
    };

    if(this.props.list_width && this.props.list_width > 0) {
      style.width = this.props.list_width; //TODO 10 походу это граница, вопрос почему разная в файрфоксе
    }



    //console.log('this.has_custom_scroll',this.props.has_custom_scroll);

    var typeahead_list_class = cx({
      'typeahead-list': true,
      'custom_scroll': this.props.has_custom_scroll
    });

    if(this.props.columns && this.props.columns > 0) {
      typeahead_list_class = cx(typeahead_list_class,  "typeahead-list-columns");
    }

    //надо всегда при переходе из состояния
    var scroll_style = this.state.scroll_visible ? {display: 'block'} : {display: 'none'};
    var thumb_style = {
      height: this.state.thumb_height,
      top: this.state.thumb_position
    };
    

    var custom_scrollbar = this.props.has_custom_scroll && 
      (<div ref="scrollbar" className="scrollbar" style={scroll_style}>
        <a onClick={this.on_scroll_arrow_up_click} className="arrow up"></a>
        <a onClick={this.on_scroll_arrow_down_click} className="arrow down"></a>
        <div onMouseDown={this.on_scroll_thumb_mouse_down} ref="thumb" style={thumb_style} className="thumb"></div>
      </div>);

    var class_holder = cx ({
      'typeahead-list-holder': true,
      'typeahead-list-holder-headers' : this.props.column_headers,
      'typeahead-list-holder-scroll-visible' : this.state.scroll_visible && this.props.has_custom_scroll
    });


    return (
      <div style={style}  className={class_holder}>

        {this.props.column_headers ? 
          <TypeaheadColumnHeaders
            show={this.props.show}
            results={this.props.results}  
            list_width={this.props.list_width} 
            column_headers={this.props.column_headers}
            columns={this.props.columns}
            column_title_idx={this.props.column_title_idx} /> : 
          undefined
        }  
        <ul ref="scrollnode" onWheel={this.on_wheel} onScroll={this.on_scroll} {...this.props} className={typeahead_list_class}>
          {this.props.results.map((result, index) => <TypeaheadResult 
            ref={ this.props.focusedValue && this.props.focusedValue.id === result.id && 'focused' || undefined } 
            key={index}
            result={result}
            columns={this.props.columns}
            column_title_idx={this.props.column_title_idx}
            focused={this.props.focusedValue && this.props.focusedValue.id === result.id}
            events_disabled={this.state.pointer_events_disabled}
            onMouseEnter={this.onMouseEnterResult}
            onClick={this.props.onSelect}
            search_term={this.props.search_term} />)}
        </ul>
        {custom_scrollbar}
      </div>
    );
  },

  getInitialState() {
    return {
      scroll_visible: false,
      thumb_height: 0,
      offset_height: 0,
      scroll_height: 0,
      thumb_position: 0,
      pointer_events_disabled: false
      //arrow_thumb_delta: null
    };
  },

  on_scroll_thumb_mouse_down (e) {
    if(this.refs && this.refs.scrollnode && this.refs.thumb && this.is_visible(this.props)) { 
      var containerNode = this.refs.scrollnode.getDOMNode();
      var thumb_top_pos = this.calc_thumb_position(containerNode.scrollTop, this.state.offset_height, this.state.scroll_height, this.state.thumb_height, this.state.thumb_max_height);

      this.scroll_thumb_mouse_y_start = e.clientY;
      this.scroll_thumb_scroll_top_pos = thumb_top_pos;

      raf(() => {
        this.setState({
          pointer_events_disabled: true
        });
        this.props.on_disable_focused_value();
      }, null);
    }
  },

  on_document_mousemove (e) {
    if(this.scroll_thumb_mouse_y_start===null) return;
    var delta_y = e.clientY - this.scroll_thumb_mouse_y_start;
    
    var {min_thumb_top, max_thumb_top} = this.calc_min_max_thumb_pos(this.state.offset_height, this.state.thumb_height, this.state.thumb_max_height);
    
    var new_thumb_top_pos =  this.scroll_thumb_scroll_top_pos + delta_y;
    
    new_thumb_top_pos = Math.max(min_thumb_top, Math.min(max_thumb_top, new_thumb_top_pos));

    var real_thumb_position = (new_thumb_top_pos - min_thumb_top) / (max_thumb_top - min_thumb_top);

    var scroll_top  =  real_thumb_position * (this.state.scroll_height - this.state.offset_height);    

    raf(()=> {
      var containerNode = this.refs.scrollnode.getDOMNode();
      containerNode.scrollTop = scroll_top;
    }, null, 'mouse_move_' + this.constructor.displayName );

  },

  on_document_mouseup (e) {
    if(this.scroll_thumb_mouse_y_start!==null) {
      this.scroll_thumb_mouse_y_start = null;
      this.scroll_thumb_scroll_top_pos = null;
      
      raf(() => {      
        this.setState({
          pointer_events_disabled: false
        });

        this.props.on_enable_focused_value();

        var containerNode = this.refs.scrollnode.getDOMNode();
        if(containerNode.scrollTop > 0.005) {
          containerNode.scrollTop = containerNode.scrollTop - 1;
          containerNode.scrollTop = containerNode.scrollTop + 1;
        } else { 
          containerNode.scrollTop = containerNode.scrollTop + 1;
          containerNode.scrollTop = containerNode.scrollTop - 1;
        }        
      }, null);
    }
  },

  on_scroll_arrow_up_click (e) {
    this.props.on_move_up();
  },

  on_scroll_arrow_down_click (e) {
    this.props.on_move_down();
  },

  pointer_events_guard() {
    

    if((new Date()).getTime() - this.prevent_scroll_2_focused_time > kPOINTER_EVENTS_PREVENT_TIME) {
      this.pointer_events_timer_started = false;
      
      raf(() => {
        //могли за это время перестартовать
        if((new Date()).getTime() - this.prevent_scroll_2_focused_time > kPOINTER_EVENTS_PREVENT_TIME) {

          this.setState({
            pointer_events_disabled: false
          });

          this.props.on_enable_focused_value();

          //надо сгенерить mouseover event иначе не будет наведения на ноду
          var containerNode = this.refs.scrollnode.getDOMNode();
          if(containerNode.scrollTop > 0.005) {
            containerNode.scrollTop = containerNode.scrollTop - 1;
            containerNode.scrollTop = containerNode.scrollTop + 1;
          } else { 
            containerNode.scrollTop = containerNode.scrollTop + 1;
            containerNode.scrollTop = containerNode.scrollTop - 1;
          }
        }
      }, null);

    } else {
      //рестартануть
      setTimeout(this.pointer_events_guard, kPOINTER_EVENTS_PREVENT_TIME - ((new Date()).getTime() - this.prevent_scroll_2_focused_time) + kSMALL_DELTA);
    }

  },

  on_wheel() {
    this.prevent_scroll_2_focused_time = (new Date()).getTime();
    if(!this.pointer_events_timer_started) {

      raf(() => {
        this.setState({
          pointer_events_disabled: true
        });

        this.props.on_disable_focused_value();
        
      }, null);

      setTimeout(this.pointer_events_guard, kPOINTER_EVENTS_PREVENT_TIME + kSMALL_DELTA);
      this.pointer_events_timer_started = true;
    }
  },

  on_scroll() {
    if(this.refs && this.refs.scrollnode && this.refs.thumb && this.is_visible(this.props)) {
      var containerNode = this.refs.scrollnode.getDOMNode();

      var scroll_top = containerNode.scrollTop;
      var thumb_position = this.calc_thumb_position(scroll_top, this.state.offset_height, this.state.scroll_height, this.state.thumb_height, this.state.thumb_max_height);
            
      if(this.state.thumb_position !== thumb_position) {
        raf(() => this.setState({
          thumb_position: thumb_position
        }), null, 'scroll_' + this.constructor.displayName);
      }
      
    }
  },

  calc_min_max_thumb_pos(offset_height, thumb_height, thumb_max_height) {
    var min_thumb_top = (offset_height - thumb_max_height)/2;
    var max_thumb_top = offset_height - (offset_height - thumb_max_height)/2 - thumb_height; //надо бы раскрыть скобки но лень
    return {min_thumb_top:min_thumb_top, max_thumb_top:max_thumb_top};
  },

  calc_thumb_position(scroll_top, offset_height, scroll_height, thumb_height, thumb_max_height) {
    var {min_thumb_top, max_thumb_top} = this.calc_min_max_thumb_pos(offset_height, thumb_height, thumb_max_height);
    var real_thumb_position = scroll_top / (scroll_height - offset_height);
    return min_thumb_top + (max_thumb_top - min_thumb_top)*real_thumb_position;
  },

  componentWillReceiveProps(next_props) {
    if(!this.is_visible(this.props) && this.is_visible(next_props)) {
      //отключить скролл пока размеры не будут посчитаны //тут без raf правильно!
      if(this.state.scroll_visible === true) {
        this.setState({
          scroll_visible: false
        });
      }
    }
  },

  componentDidUpdate() {
    

    if((new Date()).getTime() - this.prevent_scroll_2_focused_time > kPREVENT_TIME) {
      this.scrollToFocused();
    }
      
    if(this.refs && this.refs.scrollnode && this.refs.thumb && this.is_visible(this.props)) {
      
      var containerNode = this.refs.scrollnode.getDOMNode();
      
      var scroll_top = containerNode.scrollTop;
      var offset_height = containerNode.offsetHeight;
      var scroll_height = containerNode.scrollHeight;

      
      if(scroll_height > offset_height) {

        //this.scrollToFocused();

        //console.log(window.getComputedStyle(this.refs.thumb.getDOMNode()).maxHeight);

        //return ;

        var thumb_max_height =  this.state.thumb_max_height === undefined ? //расчитать единократно потом не обновлять
          style_utils.from_px_to_number(window.getComputedStyle(this.refs.thumb.getDOMNode()).maxHeight) : this.state.thumb_max_height;

        var thumb_min_height =  this.state.thumb_min_height === undefined ? //расчитать единократно потом не обновлять
          style_utils.from_px_to_number(window.getComputedStyle(this.refs.thumb.getDOMNode()).minHeight) : this.state.thumb_min_height;


        var thumb_height =  Math.max(thumb_min_height,  thumb_max_height * offset_height/scroll_height);

        var thumb_position = this.calc_thumb_position(scroll_top, offset_height, scroll_height, thumb_height, thumb_max_height);

        //console.log('thumb_position',thumb_position);

        //не стоит вызывать апдейт если переменные равны - можно попасть в вечный цикл
        if( this.state.scroll_visible === false || 
            thumb_height!==this.state.thumb_height || 
            thumb_max_height !==  this.state.thumb_max_height ||
            offset_height !== this.state.offset_height ||
            scroll_height !== this.state.scroll_height //|| thumb_position !== this.state.thumb_position
            ) {
          //расчитать и скопировать параметры для своего скрола
          raf(() => this.setState({
            scroll_visible: true,
            thumb_height: thumb_height,
            thumb_max_height: thumb_max_height,
            offset_height: offset_height,
            scroll_height: scroll_height,
            thumb_position: thumb_position
          }), null, this.constructor.displayName);
        }
      } else {
        if(this.state.scroll_visible === true) {
          raf(() => this.setState({scroll_visible:false}), null, this.constructor.displayName);
        }
      }      
    }
  },

  componentDidMount() {
    this.scrollToFocused();
    document.addEventListener('mousemove', this.on_document_mousemove);
    document.addEventListener('mouseup', this.on_document_mouseup);


  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.on_document_mousemove);
    document.removeEventListener('mouseup', this.on_document_mouseup);
  },

  componentWillMount() {
    this.ignoreFocus = false;
  },

  scrollToFocused() {
    var focused = this.refs && this.refs.focused;
    if (focused) {
      //console.log(this.refs.scrollnode, this.refs.scrollnode.getDOMNode());

      var containerNode = this.refs.scrollnode.getDOMNode();//this.getDOMNode();
      
      var scroll = containerNode.scrollTop;
      var height = containerNode.clientHeight;//containerNode.offsetHeight;



      var node = focused.getDOMNode();
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      // we update ignoreFocus to true if we change the scroll position so
      // the mouseover event triggered because of that won't have an
      // effect
      if (top < scroll) {
        this.ignoreFocus = true;
        containerNode.scrollTop = top;
      } else if (bottom - scroll > height) {
        this.ignoreFocus = true;
        containerNode.scrollTop = bottom - height;
      }
    }
  },

  
  //todo на начале скрола врубить поинтер евентс в ноне
  onMouseEnterResult(e, result) {
    // check if we need to prevent the next onFocus event because it was
    // probably caused by a mouseover due to scroll position change
    if (this.ignoreFocus) {
      this.ignoreFocus = false;
    } else {
      // we need to make sure focused node is visible
      // for some reason mouse events fire on visible nodes due to
      // box-shadow
      //var containerNode = this.getDOMNode();
      if(this.state.pointer_events_disabled) return;

      var containerNode = this.refs.scrollnode.getDOMNode();//this.getDOMNode();


      var scroll = containerNode.scrollTop;
      var height = containerNode.clientHeight;

      var node = e.target;
      var top = node.offsetTop;
      var bottom = top + node.offsetHeight;

      if (bottom > scroll && top < scroll + height) {        
        this.props.onFocus(result);      
      }
    }
  }
});


//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
var TypeaheadResult = React.createClass({

  render() {

    var className = cx({
      'typeahead-list-item': true,
      'active': this.props.focused,
      
      //Сильно много гемороя с потом наводкой на фокус
      'scrollbar-disable-events': this.props.events_disabled
    });

    if(this.props.columns && this.props.columns > 0) {
        return (
          <li
            style={{listStyleType: 'none'}}
            className={cx(className, 'typeahead-list-item-columns')}
            onClick={this.onClick}
            onMouseEnter={this.onMouseEnter}>
              {_.map(_.range(0, this.props.columns), (idx) => {
                return <span key={idx} className={"typeahead-list-col-"+idx} dangerouslySetInnerHTML={{__html:this.props.result.title[idx]}}></span>
              }, this)}
          </li>
        );
    } else {

      return (
        <li
          style={{listStyleType: 'none'}}
          className={className}
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          dangerouslySetInnerHTML={{__html:this.props.result.title}}>
          {/*<a dangerouslySetInnerHTML={{__html:this.props.result.title}}></a>*/}
        </li>
      );
    }
  },

  onClick() {
    this.props.onClick(this.props.result);
  },

  onMouseEnter(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e, this.props.result);
    }
  },

  shouldComponentUpdate(nextProps) {
    //проверить было ли выделение
    if(this.props.columns && this.props.columns > 0) {
      if(_.some(_.range(0, this.props.columns), idx => this.props.result.title[idx] !== nextProps.result.title[idx])) {
        return true;
      }
    } else {
      if(this.props.result.title !== nextProps.result.title) {
        return true;
      }
    }


    return (nextProps.result.id !== this.props.result.id ||
            nextProps.focused !== this.props.focused || 
            nextProps.events_disabled !== this.props.events_disabled);
  }
});


var TypeaheadColumnHeaders = React.createClass({
  
  is_visible(props) {
    return props && props.show && props.results && props.results.length>0;
  },

  render() {
    
    var style = {
      display: this.is_visible(this.props) ? 'block' : 'none'
    };

    if(this.props.list_width && this.props.list_width > 0) {
      style.width = this.props.list_width; //TODO 10 походу это граница, вопрос почему разная в файрфоксе
    }

    return (
      <div style={style} className="typeahead-headers">
        {_.map(_.range(0, this.props.columns), function(idx) {
          return <span key={idx} className={"typeahead-list-col-header typeahead-list-col-"+idx} dangerouslySetInnerHTML={{__html:this.props.column_headers[idx]}}></span>
        }, this)}
      </div>
    );
  }
});



/**
* Search options using specified search term treating options as an array
* of candidates.
*
* @param {Array.<Object>} options
* @param {String} searchTerm
* @param {Callback} cb
*/
function searchArray(options, searchTerm, cb) {
  if (!options) {
    return cb(null, []);
  }

  searchTerm = new RegExp(searchTerm, 'i');

  var results = [];

  for (var i = 0, len = options.length; i < len; i++) {
    if (searchTerm.exec(options[i].title)) {
      results.push(options[i]);
    }
  }

  cb(null, results);
}

module.exports = Typeahead;
