#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide a module name"
  exit 1
fi

MODULE_NAME=$1
nest g module modules/"$MODULE_NAME"
nest g controller modules/"$MODULE_NAME"/controllers/"$MODULE_NAME"
nest g service modules/"$MODULE_NAME"/services/"$MODULE_NAME"
mkdir -p src/modules/"$MODULE_NAME"/{dto,entities,guards,interfaces,types,tests}
