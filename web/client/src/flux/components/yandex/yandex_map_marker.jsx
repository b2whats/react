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
    var {object_manager, coordinates, ...clear_props} = props; //jshint ignore:line
    
    return _.extend(clear_props, 
      { hintContent: clear_props.hint,
        iconContent: clear_props.icon_number });
  },

  get_options(props) {
    var opts =  {
      iconColor: props.marker_color,
      clusterIconColor: props.cluster_color
    };
    return opts;
  },


  componentWillReceiveProps(next_props) {

    if(_.isEqual(next_props, this.props)) return;

    var next_properties = this.get_nonsystem_props (next_props);

    var curr_propertis = this.get_nonsystem_props (this.props);


    _.extend(this.props.object_manager.objects.getById(next_props.id).properties, next_properties);
    

    var obj_state = this.props.object_manager.getObjectState(next_props.id);
    
    var cluster_id = obj_state.isClustered && obj_state.cluster.id;
    
    if(!_.isEqual(next_properties, curr_propertis)) { //вот эта строчка форсит перечитать не только options но и остальные данные
      var opts = this.get_options(next_props);
      this.props.object_manager.objects.setObjectOptions(next_props.id, opts);
            
      if(cluster_id) {
        this.props.object_manager.clusters.setClusterOptions(cluster_id, this.get_options(next_props));
      }
    }


    var balloon_data = cluster_id ? this.props.object_manager.clusters.balloon.getData(): this.props.object_manager.objects.balloon.getData();
    //console.log(balloon_data);
    var balloon_id_eq = balloon_data && (cluster_id ? _.some(balloon_data.properties.geoObjects, g => g.id === next_props.id ) : (balloon_data.id === next_props.id));

    if(cluster_id) {
      //console.log(next_props.id, next_props.is_open, balloon_data);
    }

    if(balloon_data) {
      if(balloon_id_eq) {
        //переоткрыть так как данные балуна изменились находу
        if(next_props.is_open === true) {          
          if(this.props.is_open !== next_props.is_open || !_.isEqual(next_properties, curr_propertis)) {
            //вызовет close метод балуна
            if(this.props.is_open) { //уже открыт надо только обновить данные
              if(cluster_id) {
                var obj_data = this.props.object_manager.clusters.balloon.getData();
                
              } else {
                var obj_data = this.props.object_manager.objects.balloon.getData();
                _.extend(obj_data.properties, next_properties);
                this.props.object_manager.objects.balloon.setData(obj_data);
              }

            } else {
              if(cluster_id) {
                this.props.object_manager.clusters.balloon.open(cluster_id);
              } else {
                this.props.object_manager.objects.balloon.open(next_props.id);
              }            
            }
          }        
        } else {
          if(cluster_id) {
            
            if(this.props.is_open === true) {
              this.props.object_manager.clusters.balloon.close(cluster_id);
            }
          
          } else {
            this.props.object_manager.objects.balloon.close(next_props.id);
          }
        }
      } else {
        if(next_props.is_open === true) {
          if(cluster_id) {
            //this.props.object_manager.clusters.balloon.close(cluster_id);
            this.props.object_manager.clusters.balloon.open(cluster_id);
          } else {
            this.props.object_manager.objects.balloon.close(balloon_data.id);
            this.props.object_manager.objects.balloon.open(next_props.id);
          }
        }
      }
    } else {
      if(next_props.is_open === true && this.props.is_open !== next_props.is_open) {
        if(cluster_id) {
          this.props.object_manager.clusters.balloon.open(cluster_id);
        } else {
          this.props.object_manager.objects.balloon.open(next_props.id);
        }
      
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