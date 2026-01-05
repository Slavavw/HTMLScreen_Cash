@echo off
            SET EdgePath="C:/Program Files/Google/Chrome/Application/chrome.exe"            
            start "" %EdgePath% --user-data-dir=C:/Temp/Supertemp/smth --kiosk --start-fullscreen --app=http://192.168.0.116:50/
            exit