# 安装gulp仓库
rm -rf gulp
git clone https://w.gdy.io/dyf_w/gulp.git
cd gulp
# install npm
npm install
gulp initDist
cd ../
# install bower
bower install
