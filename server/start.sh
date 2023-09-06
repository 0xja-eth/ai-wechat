#!/bin/sh
SERVER_NAME=ai_test

version=0
for line in `cat /home/git/version_ai_test | head -n 1`
do
    version=$line
done

let new_version=$version+1

echo "=======================================> 当前版本号为: $version, 现在进行部署版本: $new_version"

old_images_name="$SERVER_NAME:$version"
new_images_name="$SERVER_NAME:$new_version"

old_c_name="$SERVER_NAME$version"
new_c_name="$SERVER_NAME$new_version"

#直接开始构建新版本镜像
echo "=======================================> 开始构建镜像: $new_images_name"
echo "igzQERcdMJvZFAzLl7"|sudo -S docker build -t "$new_images_name" .

#容器id
CID=$(echo "igzQERcdMJvZFAzLl7"|sudo -S docker ps -a | grep "$old_c_name" | awk '{print $1}')

if [ -n "$CID" ]; then
  echo "=======================================> 存在容器 $old_c_name, CID-$CID"
  echo "igzQERcdMJvZFAzLl7"|sudo -S docker stop "$old_c_name"
  echo "igzQERcdMJvZFAzLl7"|sudo -S docker rm "$old_c_name"
  echo "=======================================> 删除容器成功"
fi

# 运行docker容器
echo "igzQERcdMJvZFAzLl7"|sudo -S docker run -p 8090:8090 --restart=always \
 -d  --name "$new_c_name" --net contri --ip 172.18.5.4 "$new_images_name"
echo "=======================================> 新版本容器启动成功"

echo "=======================================> 开始检查是否有需要删除的更旧版本容器"
#判断是否有需要删除的镜像
if [ $new_version -gt 3 ]; then
  #删除verion-3的容器
  #镜像id
  let v=$new_version-3
  echo "=======================================> 需要删除镜像: $SERVER_NAME:$v，开始查找"
  IID=$(echo "igzQERcdMJvZFAzLl7"|sudo -S docker images | grep "$SERVER_NAME:$v" | awk '{print $3}')

  if [ -n "$IID" ]; then
    echo "=======================================> 存在 $SERVER_NAME:$v 镜像，IID=$IID，开始删除 "
    echo "igzQERcdMJvZFAzLl7"|sudo -S docker rmi "$SERVER_NAME:$v"
    echo "=======================================> 删除镜像成功"
  fi
fi

#将新版本号写回
echo $new_version > /home/git/version_ai_test
echo "=======================================> 版本更新成功"
