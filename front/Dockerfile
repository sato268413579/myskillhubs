FROM node:18

WORKDIR /app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
