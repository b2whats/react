#!/bin/bash
set -e

export LC_NUMERIC=C

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done

PARENT_DIR="$( cd -P "$( dirname "$SOURCE" )"/.. && pwd )"
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"


CROSS_COMPAT_DIR=${PARENT_DIR#$HOME}
#echo $HOME$CROSS_COMPAT_DIR
#echo /home/ice$CROSS_COMPAT_DIR

docker run --name rec_admin -d -t \
-e HOSTNAME=rec_admin \
-p 3080:80 \
-p 3081:3081 \
-v $HOME$CROSS_COMPAT_DIR:/home/ice$CROSS_COMPAT_DIR \
sentimeta/node_scikit_image

