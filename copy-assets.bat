@echo off
chcp 65001 >nul
set "SRC=%USERPROFILE%\Desktop\Tiny Swords (Update 010)\Factions\Knights\Troops"
set "DST=%~dp0assets\knights\Troops"

if not exist "%SRC%" (
  echo [失败] 找不到素材:
  echo %SRC%
  echo.
  echo 请直接在游戏里点「选择 Troops 素材文件夹」
  pause
  exit /b 1
)

if not exist "%DST%" mkdir "%DST%"
xcopy "%SRC%\*" "%DST%\" /E /I /Y >nul
echo [成功] 素材已复制，请双击 index.html 并 Ctrl+F5 刷新
pause
