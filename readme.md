#Deps
docker version >= 1.3.0

#Install
* get https://github.com/Solver-Club/sentimeta-deploy
read sentimeta-deploy/docker/readme.md
```shell
cd docker
#and install next docker images
docker build --no-cache=true -t sentimeta/baseimage ./base_image
docker build --no-cache=true -t sentimeta/python_all_scikit python_all_scikit
docker build --no-cache=true -t sentimeta/node_scikit_image node_scikit_image
```


#Use
Стартануть контейнер
```shell
cd ./web
./docker_run.sh
denter rec_admin
```

В контейнере в developer mode tmux настроен вместо runit и init скриптов
```shell
cd ./web
./tmux_run
```


#Что конкретно делает проект
* по каждой сфере получаем какие то первоначальные корзины критериев - masterbase 
* получаем критерии от API
* сравниваем - те которые никуда не попали куда то выводим 
, тех что больше нет подсвечиваем красненьким
* действия - создать корзинку, удалить, поменять имя корзинки, задать вероятность корзинки (отдельная табличка)
* добавить фичи в корзинку (фича - имя - вероятность)
* добавить правила - вида "если выбрана фича, фильтр то повысить вероятность показа корзинки"
