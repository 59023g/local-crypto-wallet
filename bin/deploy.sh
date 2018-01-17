#!/bin/bash

echo "-- unzip app -- "

# make sure zip folder is there
cd zip
DEPLOY_VERSION=$2
APP_NAME=$1

rm -r /var/www/$APP_NAME

unzip $( ls -t | head -n1 ) -d /var/www/$APP_NAME



echo "-- install app -- "

cd /var/www/$APP_NAME/build
npm install --verbose


echo "-- run app -- "
npm run start-prod
