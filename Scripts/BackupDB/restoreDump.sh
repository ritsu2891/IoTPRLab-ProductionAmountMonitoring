#!/usr/bin/env bash 

docker cp ./backup.dump mysql:/backup.dump
docker exec -it mysql mysql -u root -p iot_db < backup.dump