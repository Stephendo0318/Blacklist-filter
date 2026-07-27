@echo off
title Blacklist Filter test server
echo.
echo Blacklist Filter is available on this Wi-Fi network at:
echo http://192.168.2.31:8000/manifest.json
echo.
echo Keep this window open while testing in Revenge.
echo Press Ctrl+C here when you are finished.
echo.
python -m http.server 8000 --bind 0.0.0.0
