FROM node:18

WORKDIR /app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 本番用ビルド
RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

# 開発時のみ
# CMD ["npm", "start"]
