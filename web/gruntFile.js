'use strict';
var path = require('path');
var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');



module.exports = function (grunt) {

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-cache-breaker');
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-markdown');
//grunt.loadNpmTasks('grunt-autoprefixer');


grunt.registerTask('clear',['clean:build']);


grunt.registerTask('devscripts',['set_config:build.dev_build_dir:client/build/dev/','clean:build_tmp', 
                                 'exec:browserify_vendor', 'exec:browserify_app_exorcist',
                                 'sass:build', 
                                 'cachebreaker:css', 'cachebreaker:css_flaticon', 
                                 'cachebreaker:css_0','cachebreaker:css_1','cachebreaker:css_2','cachebreaker:css_3','cachebreaker:css_4', 'cachebreaker:css_5',
                                 'cachebreaker:js_vendor', 'cachebreaker:js', 
                                 'markdown:all', 'copy:markdown']);

//тут только билд html md и sass
grunt.registerTask('watchify_task',  ['set_config:build.dev_build_dir:client/build/dev/', //назначить директорию
                                 'sass:build', //сбилдить сасс
                                 'copy:index',
                                 'cachebreaker:css', 'cachebreaker:css_flaticon', 
                                 'cachebreaker:css_0','cachebreaker:css_1','cachebreaker:css_2','cachebreaker:css_3','cachebreaker:css_4','cachebreaker:css_5',
                                 //'cachebreaker:js_vendor', 'cachebreaker:js', //В ДЕВ ВЕРСИИ ТУТ КЕШ БРЕК УБРАН ЧТОБЫ МОЖНО БЫЛО КОД НА ЛЕТУ МЕНЯТЬ
                                 'markdown:all', 'copy:markdown']);
/*
grunt.registerTask('production',['set_config:build.dev_build_dir:client/build/dev/','clean:build_tmp', 
                                 'concat:cards', 'exec:browserify_production',  'concat:devhtml_d2', 'sass:build', 
                                 'cachebreaker:css', 'cachebreaker:css_flaticon', 
                                 'cachebreaker:css_0','cachebreaker:css_1','cachebreaker:css_2','cachebreaker:css_3','cachebreaker:css_4',
                                 'cachebreaker:js', 'markdown:all', 'copy:markdown']);

*/

//grunt.registerTask('test2',['exec:browserify_app_exorcist']);

grunt.registerTask('default',['exec:browserify_vendor', 'exec:browserify_app_exorcist', 'execute_fb_flo', 'watchify_task', 'watch:touch_sass_html_md']);

grunt.registerTask('server', ['devscripts', 'watchify_task', 'watch:all']);



grunt.registerTask('set_config', 'Set a config property.', function(name, val) {
  grunt.config.set(name, val);
  console.log('SET_CONFIG: '+name + '; v: '+grunt.config.get(name));
});

console.log (process.argv)

var fb_flo_already_started_ = false;
var watchify_already_started_ = false;

grunt.registerTask('execute_fb_flo', 'execute fb-flo server', function(name, value) {
  if(!fb_flo_already_started_) {
    console.log('executing fb-flo');
    require('./fb-flo.js');
    fb_flo_already_started_ = true;
  }
});
//запуск watchify






grunt.initConfig({
  distdir: 'dist',
  
  src: {
     dev_src:'client/src/',
     touch_sass_html_md: 'client/osx/touch_helper_sass_html_md.md',
     g_assets_dir:'client/assets/',

     dev_templates: '<%= src.dev_src %>templates/',

     sass: ['<%= src.dev_src %>sass/app.sass'],
     sass_all: ['<%= src.dev_src %>sass/**/*.sass'],

     js_main: '<%= src.dev_src %>/flux/app.js',
     
     md_files: '<%= src.dev_src %>/docs/', //документация
     md_files_tmp: '<%= build.dev_build_dir %>/tmp/docs',
     md_files_out: '<%= build.dev_build_dir %>/docs'
  },

  build:{
    dev_build_dir:'client/build/dev/',
    release_build_dir:'client/build/release/',
    js_dir: '<%= build.dev_build_dir %>js/',    
    vendor_js: '<%= build.js_dir %>vendor.js',
    app_js: '<%= build.js_dir %>app.js',
  },


 

  watch: {
    all:{
      files: ['<%= src.dev_src %>**/*.js', 
              '<%= src.dev_src %>**/*.jsx',
              '<%= src.dev_src %>**/*.tpl.html', 
              '<%= src.g_assets_dir %>**/*.css', 
              '<%= src.dev_src %>**/*.css', 
              '<%= src.sass %>', 
              '<%= src.sass_all %>'],
      tasks: ['watchify_task'],
      options:{
        spawn: false,
        //interval: 0,
        //livereload: 3081
      }
    },
    
    touch_sass_html_md: { //этот гемор чтоб под виртуалкой вотч не тормозил
      files: ['<%= src.touch_sass_html_md %>'],
      tasks: ['watchify_task'],
      options:{
        spawn: false,
        //livereload: 3081
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
    index: {
      files:[{expand: true, cwd:'<%= build.dev_templates %>',  flatten: true, src: ['<%= src.dev_templates %>*.html'], dest: '<%= build.dev_build_dir %>'}]      
    }
  },

  exec: {

    browserify_vendor: {
      cmd: "mkdir -p <%= build.dev_build_dir %>js && browserify -r 'react/addons' -r underscore -r immutable -r 'immutable/contrib/cursor' > <%= build.vendor_js %>"
    },
    
    browserify_app_exorcist: {
      cmd: "mkdir -p <%= build.dev_build_dir %>js && browserify <%= src.js_main %> -x 'react/addons' -x underscore -x 'immutable/contrib/cursor' -x immutable -t [ reactify --es6 --global] -d |  ./node_modules/exorcist/bin/exorcist.js  <%= build.app_js %>.map > <%= build.app_js %> "
    },

    /*
    browserify_production: {     
      cmd: 'NODE_ENV=production browserify -t [ reactify --es6 --global] <%= src.js_main %> | uglifyjs --compress --mangle > <%= src.js_main_out %>'
    },
    */
  },


  autoprefixer: {
    sass: {
      options: {
      },
      src: '<%= build.dev_build_dir %>lcss/sass.css',
      dest: '<%= build.dev_build_dir %>lcss/sass.css'
    }
  },

  sass: {
    build: {
      options:{
        noCache: false, //не генерить кэшпапку
        cacheLocation:'<%= build.dev_build_dir %>/../sass_cache',
        //sourcemap:true,
        require: 'sass-json-vars'
      },
      files: {
        '<%= build.dev_build_dir %>lcss/sass.css': '<%= src.sass %>'
      }
    }
  },

  //документация
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

    css_0: {

        options: {
            match: 'normalize.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/css/normalize.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },

    css_1: {

        options: {
            match: 'fonts.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/css/fonts.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },
    css_2: {

        options: {
            match: 'forms.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/css/forms.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },
    css_3: {

        options: {
            match: 'modules.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/css/modules.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },
    css_4: {

        options: {
            match: 'template.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/css/template.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },

    css_5: {

        options: {
            match: 'flexiblegs.min.css',
            replacement: 'md5',
            src: {
                path: '<%= src.g_assets_dir %>/flexiblegs/css/flexiblegs.min.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },



    css: {
        options: {
            match: ['sass.css'],
            replacement: 'md5',
            src: {
                path: '<%= build.dev_build_dir %>lcss/sass.css'
            }
        },
        files: {
            src: ['<%= build.dev_build_dir %>index.html']
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
            src: ['<%= build.dev_build_dir %>index.html']
        }
    },
 
    js_vendor: {
      options: {
          match: ['vendor.js'],
          replacement: 'md5',
          src: {
            path: '<%= build.dev_build_dir %>js/vendor.js'
          }
      },
      files: {
        src: ['<%= build.dev_build_dir %>index.html']
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
          src: ['<%= build.dev_build_dir %>index.html']
        }
    }

  }


});

/*grunt.event.on('watch', function(action, filepath, target) {
  grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
});
*/

};