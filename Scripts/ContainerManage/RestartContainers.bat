@echo off

cd %~dp0

cd ..
docker-compose restart

cd %~dp0

InitNginx