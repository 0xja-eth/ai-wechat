# 基础镜像
FROM python:3.9

# 工作目录设置
WORKDIR /usr/src/app

# 安装依赖
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝当前目录下的所有文件到工作目录下
COPY main.py ./

# CMD命令在docker run时运行
CMD [ "python", "./main.py" ]

EXPOSE 8090