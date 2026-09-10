@echo off
cd /d c:\Users\owner\Desktop\SIH
call npm.cmd test > test-p4b.log 2>&1
call npm.cmd run build > build-p4b.log 2>&1
exit /b 0
