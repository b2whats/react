require('babel-core/external-helpers');
require('babel-core/polyfill');
//мой loader для сохранить index.html куда я хочу
require('save_file_to_dir?name=index.html!./templates/index.html');

//require('save_file_to_dir?name=script.js!./assets/libs/script.js');


require('./assets/css/normalize.css');
require('./assets/css/fonts.css');
require('./assets/css/forms.css');
require('./assets/css/modules.css');
require('./assets/css/template.css');


require('./scss/app.scss');

require('./assets/tmp_icons/icons.data.svg.css');
require('./assets/flexiblegs/css/flexiblegs.min.css');

require('./assets/icons/icon-font/flaticon.css');



//require('./assets/fonts/flaticon.css');

require('./sass/app.sass');

require('./flux/app.js');
