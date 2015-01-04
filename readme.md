#Deps
docker version >= 1.3.0

#Install
* Склонировать проект https://github.com/Whatss/deploy/tree/master/docker
* склонировать сабмодули
```shell
git submodule init
git submodule update
```


* Сбилдить docker контейнеры
```shell
cd docker
#and install next docker images
./base_image/build.sh
./react_image/build.sh
```

#Use
Стартануть контейнер
```shell
#если уже существует dkill react
cd ./web
./docker_run.sh
denter react
```

В контейнере в developer mode tmux настроен вместо runit и init скриптов
```shell
cd ./web
./tmux_run
#под линукс рестартануть левое нижнее окно с параметрами grun server
```


