### jenkins错误捕捉
set -e
cd gulp
# npm i
### 清理目录
gulp c
sleep 2
### build
gulp b
