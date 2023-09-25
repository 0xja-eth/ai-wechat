# 使用 Node.js 官方镜像作为基础镜像
FROM node:18.16

# 设置工作目录
WORKDIR /app

# 复制应用程序源代码到工作目录
COPY . .

# 安装项目依赖
RUN npm install

# 启动 npm run watch 命令
CMD ["npm", "run", "watch"]
