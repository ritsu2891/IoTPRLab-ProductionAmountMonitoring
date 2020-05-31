@echo off

cd %~dp0

cd ..
docker-compose up -d

cd %~dp0

InitNginx