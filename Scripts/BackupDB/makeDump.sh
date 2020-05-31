#!/usr/bin/env bash 

docker exec -it mysql mysqldump --single-transaction -u root -p iot_db > backup.dump
docker cp mysql:/backup.dump ./backup.dump