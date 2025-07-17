@echo off
REM === 建立主資料夾與子資料夾 ===
mkdir frontend
mkdir server
mkdir server\uploads

REM === 建立 frontend 空白檔案 ===
type nul > frontend\knowledge.html
type nul > frontend\travelers.html
type nul > frontend\member_profile.html
type nul > frontend\login.html
type nul > frontend\register.html
type nul > frontend\navbar.js
type nul > frontend\style.css

REM === 建立 server 空白檔案 ===
type nul > server\index.js
type nul > server\knowledge.json
type nul > server\travelers.json
type nul > server\comments.json
type nul > server\members.json

REM === 建立 README.md ===
type nul > README.md

echo 完成所有資料夾與空白檔案建立！
pause
