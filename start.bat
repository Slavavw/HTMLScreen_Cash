@echo off            
            SET EdgePath="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
            REM URL сайта для киоска
            SET StartURL="http://192.168.0.116:3434/"
            REM Запуск в режиме киоска
            start "" %EdgePath%
            exit