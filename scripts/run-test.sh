#!/bin/sh
SERVER_NAME=ai-wechat-test

version=0
for line in `cat "$SERVER_NAME.version" | head -n 1`
do
    version=$line
done

i_name="$SERVER_NAME:$version"
c_name="$SERVER_NAME$version"

echo "=======================================> 当前版本号为: $version, 现在正在启动"

docker run -t -i --privileged --network=host \
    --restart=always -d --name "$c_name" "$i_name"

echo "=======================================> 新版本容器启动成功"
