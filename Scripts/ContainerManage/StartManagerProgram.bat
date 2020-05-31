@echo off

cd %~dp0

cd ..
cd Manager
python App.py

cd %~dp0
InitNginx