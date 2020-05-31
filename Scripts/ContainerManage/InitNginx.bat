@echo off

cd %~dp0

cd ..

docker cp default.conf nginx:/etc/nginx/conf.d/default.conf

docker exec -it nginx nginx -s reload