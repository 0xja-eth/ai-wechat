#!/bin/sh
SERVER_NAME=ai-wechat-test

version=0
for line in `cat "$SERVER_NAME.version" | head -n 1`
do
    version=$line
done

let new_version=$version+1

echo "=======================================> 当前版本号为: $version, 现在进行部署版本: $new_version"

new_i_name="$SERVER_NAME:$new_version"
old_c_name="$SERVER_NAME$version"

echo "=======================================> 开始构建镜像: $new_i_name"
docker build -f ./Dockerfile -t "$new_i_name" .

##容器id
CID=$(docker ps -a | grep "$old_c_name" | awk '{print $1}')

if [ -n "$CID" ]; then
  echo "=======================================> 存在容器 $old_c_name, CID-$CID"
  docker stop "$old_c_name"
  docker rm "$old_c_name"
  echo "=======================================> 删除容器成功"
fi

#将新版本号写回
echo "$new_version" > "$SERVER_NAME.version"
echo "=======================================> 版本更新成功"
