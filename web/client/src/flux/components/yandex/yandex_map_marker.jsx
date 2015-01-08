'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var YandexMapMarker = React.createClass({
  propTypes: {
    object_manager: PropTypes.object.isRequired,
    is_open: PropTypes.bool

    
  },

  get_nonsystem_props (props) {
    var {object_manager, is_open, coordinates, ...clear_props} = props;
    return clear_props;
  },

  componentWillReceiveProps(next_props) {
    
    var next_properties = this.get_nonsystem_props (next_props);
    var curr_propertis = this.get_nonsystem_props (this.props);

    _.extend(this.props.object_manager.objects.getById(next_props.id).properties, next_properties);
    
    var balloon_data = this.props.object_manager.objects.balloon.getData();
    if(balloon_data) {
      if(balloon_data.id === next_props.id) {
        //переоткрыть так как данные балуна изменились находу
        if(next_props.is_open === true) {          
          if(this.props.is_open !== next_props.is_open || !_.isEqual(next_properties, curr_propertis)) {
            //вызовет close метод балуна
            if(this.props.is_open) { //уже открыт надо только обновить данные
              var obj_data = this.props.object_manager.objects.balloon.getData();
              _.extend(obj_data.properties, next_properties);
              this.props.object_manager.objects.balloon.setData(obj_data);                            
            } else {
              this.props.object_manager.objects.balloon.open(next_props.id);
            }
          }        
        } else {
          this.props.object_manager.objects.balloon.close(next_props.id);
        }
      } else {
        if(next_props.is_open === true) {
          this.props.object_manager.objects.balloon.close(balloon_data.id);
          this.props.object_manager.objects.balloon.open(next_props.id);
        }
      }
    } else {
      if(next_props.is_open === true && this.props.is_open !== next_props.is_open) {
        this.props.object_manager.objects.balloon.open(next_props.id);
      }
    }
  },

  componentDidMount() {
    //console.log('did mount', this.props.id);
    var pt = {
      id: this.props.id,
      'type': 'Feature',
      geometry: {
        'type': 'Point',
         coordinates: this.props.coordinates
      },
      properties: {
        iconContent: this.props.icon_number,
        title: this.props.title,
        address: this.props.address,
        phone: this.props.phone,
        show_phone: this.props.show_phone //if потестить
      }
    };
    
    this.props.object_manager.add(pt);
  },



  componentWillUnmount() {
    //console.log('will Unmount', this.props.id);
    this.props.object_manager.remove(this.props.id);
  },

  shouldComponentUpdate() {
    return false; //внутри этой директивы реакт не работает поэтому нет смысла ее обновлять методами реакт
  },
  render () {
    return null;
  }
});

module.exports = YandexMapMarker;