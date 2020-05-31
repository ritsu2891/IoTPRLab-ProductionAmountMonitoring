@echo off
cd %~dp0

cd ..
docker exec -it mysql mysql -u root -proot -e"delete from iot_db.data_table;"