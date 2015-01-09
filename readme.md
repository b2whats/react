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


Ссылки для тестов

много меток по автопартам
```
http://localhost:3080/find/moskva/p%D0%B5%D0%BC%D0%BE%D0%BD%D1%82%D0%BD%D1%8B%D0%B9_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%82_%D0%B4%D0%BB%D1%8F_%D0%B1%D0%BB%D0%BE%D0%BA%D0%B0/skoda/06e998907c/252302/_/_/_
```








