cd gulp
# npm i
gulp c
sleep 2
gulp b
cd dist
git add .
git commit -am autoBuild
git push origin buildDev