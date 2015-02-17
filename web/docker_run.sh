#!/bin/bash
#set -e
CONTAINER_NAME=whats/react
DOCKER_HOST_NAME=react

export LC_NUMERIC=C

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done

PARENT_DIR="$( cd -P "$( dirname "$SOURCE" )"/.. && pwd )"
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

#если мак то настроить ватчман #brew install watchman
SYSTEM=`uname`
[ "$SYSTEM" = "Darwin" ] && ./inotify_touch_helper.sh 

CROSS_COMPAT_DIR=${PARENT_DIR#$HOME}

docker run --name "$DOCKER_HOST_NAME" -d -t \
-e HOSTNAME="$DOCKER_HOST_NAME" \
-p 3080:80 \
-p 3081:3081 \
-p 3082:3082 \
-v $HOME$CROSS_COMPAT_DIR:/home/ice$CROSS_COMPAT_DIR \
--add-host "$DOCKER_HOST_NAME":127.0.0.1 \
"$CONTAINER_NAME"


#подождать запуска runit и тп
sleep 1
sleep 1
sleep 1

#Запустить внутри контейнера все что надо
docker exec -it -d "$DOCKER_HOST_NAME" su - ice -c "script -q /dev/null -c 'cd /home/ice$CROSS_COMPAT_DIR/web && ./tmux_run'"
#echo 'please wait'
#sleep 10 #чуть подождать и отдетачить клиента от контейнера
CLIENT_LIST=
sleep 1
docker exec -it "$DOCKER_HOST_NAME" su - ice -c "tmux list-clients"

sleep 1
docker exec -it "$DOCKER_HOST_NAME" su - ice -c "tmux list-clients"

sleep 1
docker exec -it "$DOCKER_HOST_NAME" su - ice -c "tmux list-clients"

#почему то без этого слипа дебиан иногда вылетает на docker exec без ошибок
sleep 1

while [[ -z "$CLIENT_LIST" ]]; do
  CLIENT_LIST=$(docker exec -it "$DOCKER_HOST_NAME" su - ice -c "tmux list-clients" | grep -v 'failed')
  echo 'please wait ...' $CLIENT_LIST
  sleep 2
done
echo 'start exit'
#если где то окажется что не /dev/pts/0 то отловить
docker exec -it -d "$DOCKER_HOST_NAME" su - ice -c "tmux detach-client -t /dev/pts/0"

