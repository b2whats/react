#!/bin/bash

#you need to install watchman tool from facebook
#brew install watchman

#лучше проставить крыжики для git иначе глюки на rebase
#git config --global core.trustctime false
set -e

export LC_NUMERIC=C
export kWATCH_DIR='client/src'
export kWATCH_ASSETS_DIR='client/assets'

export kTRIGGER_NAME='trigger'
export kTRIGGER_NAME_ASSETS='trigger_assets'

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done

DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

WATCH_DIR="$( cd -P "$( dirname "$SOURCE" )/$kWATCH_DIR" && pwd )"
WATCH_ASSETS_DIR="$( cd -P "$( dirname "$SOURCE" )/$kWATCH_ASSETS_DIR" && pwd )"

echo 'START LOG' > "$DIR/log_inotify.txt"

#смотрим src
watchman trigger-del "$WATCH_DIR" "$kTRIGGER_NAME"
watchman -- trigger "$WATCH_DIR" "$kTRIGGER_NAME" -- "$DIR/watch.sh"

#смотрим assets
watchman trigger-del "$WATCH_ASSETS_DIR" "$kTRIGGER_NAME_ASSETS"
watchman -- trigger "$WATCH_ASSETS_DIR" "$kTRIGGER_NAME_ASSETS" -- "$DIR/watch.sh"



#echo $DIR

#if [ "$#" -ne 0 ]; then
#  boot2docker ssh -t "touch $DIR/client/touch_helper.md"
#else
#  fswatch-run ./client/src './inotify_touch_helper.sh param_more_than_zero'
#fi
