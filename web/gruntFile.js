'use strict';
var path = require('path');
var _ = require('underscore');
var crypto = require('crypto');

module.exports = function (grunt) {

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-recess');
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-cache-breaker');
grunt.loadNpmTasks('grunt-exec');

grunt.loadNpmTasks('grunt-markdown');

//grunt.loadNpmTasks('grunt-autoprefixer');

//grunt.loadNpmTasks('grunt-nodemon');

grunt.registerTask('devscripts',['set_config:build.dev_build_dir:client/build/dev/','clean:build_tmp', 
                                 'concat:cards', 'exec:browserify',  'concat:devhtml_d2', 'sass:build_d2', 
                                 'cachebreaker:css', 'cachebreaker:css_flaticon', 
                                 'cachebreaker:js', 'markdown:all', 'copy:markdown']);


grunt.registerTask('watchify',  ['set_config:build.dev_build_dir:client/build/dev/','clean:build_tmp',
                                 'concat:devhtml_d2', 'sass:build_d2', 
                                 'cachebreaker:css', 'cachebreaker:css_flaticon', 
                                 'cachebreaker:js', 'markdown:all', 'copy:markdown', 'exec:sleep', 'exec:exorcist']);


grunt.registerTask('server', ['watchify', 'watch:all']);



grunt.registerTask('default',['watchify', 'watch:touchw']);
//grunt.registerTask('default',['devscripts', 'watch:nonjs']);



grunt.registerTask('clear',['clean:build']);


grunt.registerTask('test',['exec:test']);


grunt.registerTask('set_config', 'Set a config property.', function(name, val) {
  grunt.config.set(name, val);
  console.log('SET_CONFIG: '+name + '; v: '+grunt.config.get(name));

});


grunt.initConfig({
  distdir: 'dist',

  src: {
     dev_src:'client/src/',
     touch_file: 'client/touch_helper.md',
     admin_src:'admin/src/',
     g_assets_dir:'client/assets/',
     templates_sub_dir: 'templates/',
     dev_templates: '<%= src.dev_src %><%= src.templates_sub_dir %>',
     tpl: {
        header_dev_sass_tpls_d2 : ['<%= src.dev_templates %>header_dev_sass_d2.tpl.html'],
        innerbody_dev_sass_tpls : ['<%= src.dev_templates %>innerbody_sass.tpl.html'],
        livereload_dev_tpls : ['<%= src.dev_templates %>livereload.tpl.html'],
        footer_dev_tpls : ['<%= src.dev_templates %>footer.tpl.html'],
        app_mains: ['<%= src.dev_templates %>*/**/*.tpl.html']
      },

     sass_d2: ['<%= src.dev_src %>sass/app.sass'],
     sass_watch_2: ['<%= src.dev_src %>sass/**/*.sass', '<%= src.dev_src %>sass_d2/**/*.sass'],

     js_main: '<%= src.dev_src %>/flux/app.js',
     js_main_out: '<%= build.dev_build_dir %>js/app.js',
     js_main_w_map: '<%= build.dev_build_dir %>js/app_w_map.js',

     md_files: '<%= src.dev_src %>/docs/',
     md_files_tmp: '<%= build.dev_build_dir %>/tmp/docs',
     md_files_out: '<%= build.dev_build_dir %>/docs'

  },
  build:{
    dev_build_dir:'client/build/dev/',
    release_build_dir:'client/build/release/'
  },
  watch: {
    all:{
      files: ['<%= src.dev_src %>**/*.js', '<%= src.dev_src %>**/*.jsx','<%= src.dev_src %>**/*.tpl.html', '<%= src.dev_src %>**/*.css', '<%= src.sass_d2 %>', '<%= src.sass_watch_2 %>'],
      tasks: ['devscripts'],
      options:{
        spawn: false,
        //interval: 5000,
        livereload: 3081
      }
    },
    
    touch: {
      files: ['<%= src.touch_file %>'],
      tasks: ['devscripts'],
      options:{
        spawn: false,
        livereload: 3081
      }
    },

    touchw: {
      files: ['<%= src.touch_file %>'],
      tasks: ['watchify'],
      options:{
        spawn: false,
        livereload: 3081
      }
    }

  },

  clean: {
    build: ['<%= build.dev_build_dir %>'],
    build_tmp: ['<%= build.dev_build_dir %>/tmp', '<%= build.dev_build_dir %>/docs', '<%= build.dev_build_dir %>/lcss'],
    release: ['<%= build.release_build_dir %>']
  },

  copy:{
    markdown:{
      files:[{expand: true, cwd:'<%= src.md_files_tmp %>', flatten: true, src: ['**/*.html'], dest: '<%= src.md_files_out %>'}]
    },

    devscripts:{
      files:[{expand: true, cwd:'<%= src.dev_src %>', src: ['**/*.js'], dest: '<%= build.dev_build_dir %>js/'}]
    }
  },

  exec: {
    browserify: {     
      cmd: 'mkdir -p <%= build.dev_build_dir %>js && browserify -t [ reactify --es6 --global] --debug <%= src.js_main %> | ./node_modules/exorcist/bin/exorcist.js <%= src.js_main_out %>.map > <%= src.js_main_out %>'
    },
    exorcist: {
      cmd: 'cat <%= src.js_main_w_map%> | ./node_modules/exorcist/bin/exorcist.js <%= src.js_main_out %>.map > <%= src.js_main_out %>'
    },
    sleep: {
      cmd: 'sleep 1'
    },
    test: {
      cmd: 'NODE_ENV=production browserify --debug <%= src.js_main %> -o <%= src.js_main_out %>'
    }
  },

  concat:{
    cards:{
      src: ['<%= src.tpl.app_mains %>'],
      dest : '<%= build.dev_build_dir %>tmp/cards.tmp',
      options: {
        separator: '\n',
        process: function(src, filepath) {
          //var base_name = path.basename(filepath);
          //if(base_name.indexOf('card_')>=0)
          //console.log('TEMPLATE FILE PATHES', filepath);
          var fpath_array = filepath.split('/');
          if(_.some(fpath_array, function(dir_or_file_name){ return dir_or_file_name[0]==='_';})){
            return '';
          }
          if(filepath.indexOf('.ractive.')>0) {
            return '<script id="'+ path.basename(filepath,'.ractive.tpl.html') + '" type="text/ractive">\n' + src + '\n</script>\n';
          } else {
            return '<script id="'+ path.basename(filepath,'.tpl.html') + '" type="text/ng-template">\n' + src + '\n</script>\n';
          }
        }
      }
    },
    
    devhtml_d2:{ //TODO для релиза создать новый relhtml и убрать livereload
      src: ['<%= src.tpl.header_dev_sass_tpls_d2 %>',
            '<%= build.dev_build_dir %>tmp/cards.tmp',
            '<%= src.tpl.innerbody_dev_sass_tpls %>',
            //'<%= build.dev_build_dir %>tmp/dev_scripts_includes.tmp',
            '<%= src.tpl.livereload_dev_tpls %>',
            '<%= src.tpl.footer_dev_tpls %>'],

      dest:'<%= build.dev_build_dir %>index_sass_d2.html',
      options: {
        separator: '\n'
      }
    }
  },

  autoprefixer: {
    sass_build_d2: {
      options: {
      },
      src: '<%= build.dev_build_dir %>lcss/dev_sass_d2.css',
      dest: '<%= build.dev_build_dir %>lcss/dev_sass_d2.css'
    }
  },

  sass: {

    build_d2: {
      options:{
        noCache:false, //не генерить кэшпапку
        cacheLocation:'<%= build.dev_build_dir %>/../sass_cache',
        //sourcemap:true,
        require: 'sass-json-vars'

      },
      files: {
        '<%= build.dev_build_dir %>lcss/dev_sass_d2.css': '<%= src.sass_d2 %>'
      }
    }
  },

  markdown: {
    all: {
      files: [
        {
          expand: true,
          src: '<%= src.md_files %>/*.md',
          dest: '<%= src.md_files_tmp %>',
          ext: '.html'
        }
      ],
      options: {
        markdownOptions: {
          gfm: true,
          highlight: 'manual'
        }
      }
    }
  },

  cachebreaker: {
    css: {
        options: {
            match: ['dev_sass_d2.css'],
            replacement: 'md5',
            src: {
                path: '<%= build.dev_build_dir %>lcss/dev_sass_d2.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index_sass_d2.html']
        }
    },
    css_flaticon: {
        options: {
            match: ['flaticon.css'],
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/icons/icon-font/flaticon.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index_sass_d2.html']
        }
    },
 


    js: {
        options: {
            match: ['app.js'],
            replacement: 'md5',
            src: {
              path: '<%= build.dev_build_dir %>js/app.js'
            }
        },
        files: {
          src: ['<%= build.dev_build_dir %>index_sass_d2.html']
        }
    }

  }


});

/*grunt.event.on('watch', function(action, filepath, target) {
  grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
});
*/

};