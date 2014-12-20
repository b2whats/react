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


