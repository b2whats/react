#!/bin/bash

#you need to install
#brew install watchman

#основная задача - потачить файлы внутри boot2docker но не ловить этот тач у себя чтобы не зайти в вечный цикл
#смысл алгоритма - тачим сначала файл который НЕ внутри пути триггера
#тачим access

set -e

export LC_NUMERIC=C
export kWATCH_DIR='client/src'

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done

DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

WATCH_DIR="$( cd -P "$( dirname "$SOURCE" )/$kWATCH_DIR" && pwd )"

HELPER_TOUCH_TIME=`stat -c %y "$DIR/client/touch_helper.md"`


#echo $WATCH_DIR
TOUCHES=()
for var in "$@"
do
  if [ -f "$WATCH_DIR/$var" ]; then
    FILE_TOUCH_TIME=`stat -c %y $WATCH_DIR/$var`
    if [ "$FILE_TOUCH_TIME" != "$HELPER_TOUCH_TIME" ]; then
      TOUCHES+=("$WATCH_DIR/$var")
    fi
  fi
done

if [ ${#TOUCHES[@]} -gt 0 ]; then
  #array not empty
  echo "${TOUCHES[@]}" >> "$DIR/log_inotify.txt"
  boot2docker ssh -t "touch -a $DIR/client/touch_helper.md"
  boot2docker ssh -t "touch -a -r $DIR/client/touch_helper.md ${TOUCHES[@]}"
else 
  echo "touch empty" >> "$DIR/log_inotify.txt"
fi

