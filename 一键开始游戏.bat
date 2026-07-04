@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "SRC=%USERPROFILE%\Desktop\Tiny Swords (Update 010)\Factions\Knights\Troops"
set "DST=%~dp0assets\knights\Troops"

echo 正在准备游戏...

if exist "%SRC%" (
  if not exist "%DST%" mkdir "%DST%"
  xcopy "%SRC%\*" "%DST%\" /E /I /Y >nul
  echo [OK] 素材已复制
) else (
  echo [提示] 未找到桌面素材，将使用游戏内占位图
  echo 路径: %SRC%
)

echo 正在打开游戏...
start "" "%~dp0index.html"
