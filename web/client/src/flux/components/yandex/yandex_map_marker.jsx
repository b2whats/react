'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;

var YandexMapMarker = React.createClass({
  propTypes: {
    object_manager: PropTypes.object.isRequired,
    is_open: PropTypes.bool, //открыт ли балун
    coordinates: PropTypes.array.isRequired
    //остальные параметры рисуются в шаблоне по желанию
  },

  get_nonsystem_props (props) {
    var {object_manager, is_open, coordinates, ...clear_props} = props; //jshint ignore:line
    
    return _.extend(clear_props, 
      { hintContent: clear_props.hint,
        iconContent: clear_props.icon_number });
  },

  get_options(props) {
    var opts =  {
      iconColor: props.marker_color,
      /*
      zIndex: props.marker_z_index,
      zIndexHover: props.marker_z_index,
      zIndexActive: props.marker_z_index,
      interactiveZIndex: false
      */
    };

    if(props.marker_z_index) {
      opts.zIndex = props.marker_z_index;
    }

    return opts;
  },

  componentWillReceiveProps(next_props) {
    
    var next_properties = this.get_nonsystem_props (next_props);

    var curr_propertis = this.get_nonsystem_props (this.props);

    _.extend(this.props.object_manager.objects.getById(next_props.id).properties, next_properties);
    
    if(!_.isEqual(next_properties, curr_propertis)) { //вот эта строчка форсит перечитать не только options но и остальные данные
      var opts = this.get_options(next_props);
      //if(opts.zIndex) {
        //console.log('n=',this.props.icon_number, '  z=',opts.zIndex);
        //console.log(this.props.object_manager.objects.getById(next_props.id));
      //}
      //this.props.object_manager.objects.getById(next_props.id).options = opts;
      this.props.object_manager.objects.setObjectOptions(next_props.id, opts);

      if(next_props.rank === 1) {
        console.log(next_props.id, this.props.object_manager.objects.getById(next_props.id).options);
      }

    }

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
    var properties = this.get_nonsystem_props (this.props);
    var options = this.get_options(this.props);

    var pt = {
      id: this.props.id,
      'type': 'Feature',
      geometry: {
        'type': 'Point',
         coordinates: this.props.coordinates
      },
      properties: properties,
      options: options
    };

    this.props.object_manager.add(pt);
  },

  componentWillUnmount() {
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