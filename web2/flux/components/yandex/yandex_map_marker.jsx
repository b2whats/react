'use strict';

var _ = require('underscore');

var React = require('react/addons');
var PropTypes = React.PropTypes;


var trace = () => {
  if(false) {  
    console.log.apply(console, [].slice.call(arguments))
  }
};

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

      if(cluster_id) {
        //trace('cluster set options ', next_props.id, JSON.stringify(opts));
        
        var popts = this.props.object_manager.clusters.getById(cluster_id).options;
        if(popts.clusterIconColor!==opts.clusterIconColor) {
          this.props.object_manager.clusters.setClusterOptions(cluster_id, opts);            
        }
        

      } else {
        //trace('marker set options ', next_props.id, JSON.stringify(opts));
        this.props.object_manager.objects.setObjectOptions(next_props.id, opts);
      }
    }


    var balloon_data = cluster_id ? this.props.object_manager.clusters.balloon.getData(): this.props.object_manager.objects.balloon.getData();
    //console.log(balloon_data);
    var balloon_id_eq = balloon_data && (cluster_id ? _.some(balloon_data.properties.geoObjects, g => g.id === next_props.id ) : (balloon_data.id === next_props.id));

    //console.log('next_props.id', next_props.id, balloon_data, balloon_id_eq, ', next_props.is_open', next_props.is_open, ', this.props.is_open',this.props.is_open);
    if(balloon_data) {
      if(balloon_id_eq) {
        //переоткрыть так как данные балуна изменились находу
        if(next_props.is_open === true) {          
          if(this.props.is_open !== next_props.is_open || !_.isEqual(next_properties, curr_propertis)) {
            //вызовет close метод балуна
            if(this.props.is_open) { //уже открыт надо только обновить данные
              if(cluster_id) {
                var obj_data = this.props.object_manager.objects.getById(next_props.id);            
                _.extend(obj_data.properties, next_properties);
                this.props.object_manager.clusters.state.set('activeObject', this.props.object_manager.clusters.state.get('activeObject'));
                trace('0 cluster set active object ', next_props.id, next_props.is_open);
              } else {
                var obj_data = this.props.object_manager.objects.balloon.getData();
                _.extend(obj_data.properties, next_properties);
                this.props.object_manager.objects.balloon.setData(obj_data);
                trace('0 balloon.setData ', next_props.id, next_props.is_open);
              }

            } else {
              if(cluster_id) {                
                this.props.object_manager.clusters.state.set('activeObject', this.props.object_manager.objects.getById(next_props.id));
                this.props.object_manager.clusters.balloon.open(cluster_id);
                trace('1 cluster balloon open ', next_props.id, next_props.is_open);
              } else {
                trace('1 balloon open ', next_props.id, next_props.is_open);
                this.props.object_manager.objects.balloon.open(next_props.id);
              }            
            }
          }        
        } else {
          if(cluster_id) {
            
            if(this.props.is_open === true) {
              trace('2 cluster balloon close ', next_props.id, next_props.is_open);
              this.props.object_manager.clusters.balloon.close(cluster_id);
            } else {
              //если кластер открыт а он открыт тут то тоже обновить данные при условии чт балун в кластере
                var obj_data = this.props.object_manager.objects.getById(next_props.id);            
                _.extend(obj_data.properties, next_properties);
                this.props.object_manager.clusters.state.set('activeObject', this.props.object_manager.clusters.state.get('activeObject'));
                trace('2 cluster set activeObject ', next_props.id, next_props.is_open);
            }
          
          } else {
            trace('2 balloon close ', next_props.id, next_props.is_open);
            this.props.object_manager.objects.balloon.close(next_props.id);
          }
        }
      } else {
        if(next_props.is_open === true) {
          if(cluster_id) {
            this.props.event_freezer();
            this.props.object_manager.objects.balloon.close(next_props.id, true);

            this.props.object_manager.clusters.state.set('activeObject', this.props.object_manager.objects.getById(next_props.id));
            this.props.object_manager.clusters.balloon.open(cluster_id);
            trace('4 cluster open ', next_props.id, next_props.is_open);

            setTimeout(() => {
              this.props.event_unfreezer();
            }, 100);

          } else {
            this.props.object_manager.objects.balloon.close(balloon_data.id);
            this.props.object_manager.objects.balloon.open(next_props.id);
            trace('4 close open ballonn', next_props.id, next_props.is_open);
          }
        }
      }
    } else {
      if(next_props.is_open === true && this.props.is_open !== next_props.is_open) {
        if(cluster_id) {
          this.props.object_manager.clusters.state.set('activeObject', this.props.object_manager.objects.getById(next_props.id));
          this.props.object_manager.clusters.balloon.open(cluster_id);
          trace('5 cluster setActiveObject and open ballonn', next_props.id, next_props.is_open);
        } else {
          trace('5 open ballonn', next_props.id);
          this.props.object_manager.objects.balloon.open(next_props.id, next_props.is_open);
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