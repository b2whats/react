'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var YandexMapMarker = React.createClass({
  propTypes: {
    object_manager: PropTypes.object.isRequired
  },

  componentWillReceiveProps(next_props) {
    
    var next_properties = {
      iconContent: next_props.icon_number,
      title: next_props.title,
      address: next_props.address,
      phone: next_props.phone,
      show_phone: next_props.show_phone //if потестить
    };

    _.extend(this.props.object_manager.objects.getById(next_props.id).properties, next_properties);
    
    var balloon_data = this.props.object_manager.objects.balloon.getData();
    if(balloon_data) {
      if(balloon_data.id == next_props.id) {
        //переоткрыть так как данные балуна изменились находу
        this.props.object_manager.objects.balloon.open(balloon_data.id);
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