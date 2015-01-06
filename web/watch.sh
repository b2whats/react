#!/bin/bash

#you need to install
#brew install watchman

#основная задача - потачить файлы внутри boot2docker но не ловить этот тач у себя чтобы не зайти в вечный цикл
#смысл алгоритма - тачим сначала файл который НЕ внутри пути триггера
#тачим access

set -e

export LC_NUMERIC=C
kWATCH_DIR='client/src'
[[ $WATCHMAN_TRIGGER == 'trigger_assets' ]] && kWATCH_DIR='client/assets';


SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done



DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

WATCH_DIR="$( cd -P "$( dirname "$SOURCE" )/$kWATCH_DIR" && pwd )"

HELPER_TOUCH_TIME=`stat -c %y "$DIR/client/osx/touch_helper.md"`

EXTENSIONS_TO_TOUCH_OTHER_FILE="#md# #sass# #scss# #css# #json# #html#"
NEED_TOUCH=

#echo $WATCH_DIR
TOUCHES=()

for var in "$@"
do
  if [ -f "$WATCH_DIR/$var" ]; then
    
    FILE_TOUCH_TIME=`stat -c %y $WATCH_DIR/$var`
    if [ "$FILE_TOUCH_TIME" != "$HELPER_TOUCH_TIME" ]; then
      
      TOUCHES+=("$WATCH_DIR/$var")

      FILE_EXTENSION="#${var##*.}#"
      [[ $EXTENSIONS_TO_TOUCH_OTHER_FILE =~ $FILE_EXTENSION ]] && NEED_TOUCH="TRUE";

    fi
  fi
done

echo "is sass md css json touched $NEED_TOUCH" >> "$DIR/log_inotify.txt"

if [ ${#TOUCHES[@]} -gt 0 ]; then
  #array not empty
  echo "was touch" "${TOUCHES[@]}" >> "$DIR/log_inotify.txt"
  
  #если ext хоть одного файла html или sass или css то тачнуть этот файл client/osx/touch_helper_sass_html_md.md
  [[ "$NEED_TOUCH" == "TRUE" ]] && boot2docker ssh -t "touch -a $DIR/client/osx/touch_helper_sass_html_md.md"

  boot2docker ssh -t "touch -a $DIR/client/osx/touch_helper.md"
  #выставить время access по тач файлу всем тронутым
  boot2docker ssh -t "touch -a -r $DIR/client/osx/touch_helper.md ${TOUCHES[@]}"
else 
  echo "touch empty" >> "$DIR/log_inotify.txt"
fi

