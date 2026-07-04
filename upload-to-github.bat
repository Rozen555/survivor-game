@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   幸存者 - 上传到 GitHub
echo ========================================
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
  echo [错误] 未安装 Git
  echo 请安装: https://git-scm.com/download/win
  pause
  exit /b 1
)

where gh >nul 2>&1
if %errorlevel% neq 0 (
  echo [错误] 未安装 GitHub CLI
  echo 请安装: https://cli.github.com
  pause
  exit /b 1
)

echo 检查 GitHub 登录状态...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo 尚未登录 GitHub，即将打开登录流程...
  echo 按提示选择: GitHub.com - HTTPS - Login with browser
  echo.
  gh auth login
  if %errorlevel% neq 0 (
    echo [错误] 登录失败
    pause
    exit /b 1
  )
)

if not exist ".git" (
  echo 初始化 Git 仓库...
  git init
  git branch -M main
)

echo 提交代码...
git add .
git diff --cached --quiet
if %errorlevel% equ 0 (
  echo [提示] 没有新的改动需要提交
) else (
  git commit -m "Initial commit: survivor roguelike game"
)

echo.
set /p REPO_NAME="仓库名 (直接回车使用 survivor-game): "
if "%REPO_NAME%"=="" set REPO_NAME=survivor-game

git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
  echo 已有远程仓库，正在推送...
  git push -u origin main
) else (
  echo 在 GitHub 创建公开仓库并推送...
  gh repo create %REPO_NAME% --public --source=. --remote=origin --push
)

if %errorlevel% neq 0 (
  echo.
  echo [错误] 上传失败。常见原因:
  echo   - 仓库名已被占用，换一个名字再试
  echo   - 网络问题
  pause
  exit /b 1
)

echo.
echo ========================================
echo   上传成功!
echo ========================================
for /f "delims=" %%i in ('gh repo view --json url -q .url 2^>nul') do set REPO_URL=%%i
if defined REPO_URL (
  echo 仓库地址: %REPO_URL%
  echo.
  echo 开启在线游玩 (GitHub Pages):
  echo   1. 打开 %REPO_URL%/settings/pages
  echo   2. Source 选 Deploy from a branch
  echo   3. Branch 选 main, 文件夹选 / (root)
  echo   4. 保存后访问: https://你的用户名.github.io/%REPO_NAME%/
) else (
  echo 请打开 https://github.com 查看你的仓库
)
echo.
pause
