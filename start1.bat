rem :: set file location

if exist %localappdata%\google\chrome\application\chrome.exe (
 set chrome_exe="%localappdata%\google\chrome\application\chrome.exe"
)  

if exist %PROGRAMFILES(x86)%\google\chrome\application\chrome.exe (
 set chrome_exe="%PROGRAMFILES(x86)%\google\chrome\application\chrome.exe"
 )

if exist %PROGRAMFILES%\google\chrome\application\chrome.exe (
 set chrome_exe="%PROGRAMFILES%\google\chrome\application\chrome.exe"
 ) 

 rem :: run chrome
%chrome_exe% --start-fullscreen --app=http://192.168.0.116:50