@echo off
REM Путь к msedge.exe (может отличаться, если у вас 32-битная система)
SET EdgePath="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

REM URL сайта для киоска
SET StartURL="http://192.168.0.113:4001/"

REM Запуск в режиме киоска
start "" %EdgePath% --kiosk %StartURL% --edge-kiosk-type=fullscreen --no-first-run
exit