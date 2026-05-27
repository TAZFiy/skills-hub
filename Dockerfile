FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
# 源码通过 volume 挂载，不 COPY
EXPOSE 3000
CMD ["npm", "run", "dev"]
