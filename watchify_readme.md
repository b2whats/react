#Что то я изменил
сервачок вотч от фисбук
brew install watchman
запускать
watchify ./flux/app.js -o ../build/dev/japp.js -t [ reactify --es6 --global] -v

НАЛАБАТЬ ТАЧ НОРМАЛЬНЫЙ
разбирать переменные если файл запускать тач

watchman watch-list
watchman watch-del ./client/src/
watchman trigger-list ./client/src/

watchman trigger-del ./client/src/ ssss
watchman -- trigger ./client/src/ 'ssss' -- /Users/ice/web_projects/recommendation_admin_rnd/web/watch.sh


cat $TMPDIR/.watchman.$USER.log
watchman shutdown-server

touch ./client/touch_helper.md
touch -r ./client/touch_helper.md ./client/src/flux/app.js


boot2docker ssh -t "touch -a /Users/ice/web_projects/recommendation_admin_rnd/web/client/touch_helper.md"
boot2docker ssh -t "touch -a -r /Users/ice/web_projects/recommendation_admin_rnd/web/client/touch_helper.md /Users/ice/web_projects/recommendation_admin_rnd/web/client/src/flux/app.js"

stat -c %y ./client/touch_helper.md
stat -c %y ./client/src/flux/app.js


touch ./client/src/flux/app.js
touch ./client/src/flux/components/main.jsx
touch ./client/src/flux/components/pointer_events_disabler.js
touch ./client/src/flux/app.js
touch ./client/src/flux/components/main.jsx
touch ./client/src/flux/components/pointer_events_disabler.js
touch ./client/src/flux/components/mixins/router_mixin.js
touch ./client/src/flux/components/mixins/raf_state_update.js ./client/src/flux/components/mixins/router_mixin.js ./client/src/flux/app.js



