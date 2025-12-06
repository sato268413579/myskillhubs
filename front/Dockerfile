# ビルドステージ
FROM node:18 AS build

WORKDIR /app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 本番用ビルド
RUN npm run build

# 本番ステージ - Nginx
FROM nginx:alpine

# ビルドされたファイルをNginxのドキュメントルートにコピー
COPY --from=build /app/build /usr/share/nginx/html

# カスタムNginx設定があればコピー
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
