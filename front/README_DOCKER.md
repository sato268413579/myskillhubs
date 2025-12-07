# Docker 使用方法

このプロジェクトは開発環境と本番環境の両方で使用できる統合されたDocker構成を持っています。

## 開発環境

開発環境では、ホットリロード機能付きのReact開発サーバーが起動します。

```bash
# 開発環境で起動
docker-compose --env-file .env.development up -d

# または環境変数を直接指定
BUILD_TARGET=development docker-compose up -d
```

- ポート: 3000
- ホットリロード: 有効
- ボリュームマウント: 有効（コード変更が即座に反映）

## 本番環境

本番環境では、最適化されたビルドとNginxで静的ファイルを配信します。

```bash
# 本番環境で起動
docker-compose --env-file .env.production up -d --build

# または環境変数を直接指定
BUILD_TARGET=production docker-compose up -d --build
```

- ポート: 80
- 最適化ビルド: 有効
- Nginx配信: 有効

## コンテナの停止

```bash
docker-compose down
```

## ログの確認

```bash
# すべてのログ
docker-compose logs -f

# frontコンテナのみ
docker-compose logs -f front
```

## 環境変数

主要な環境変数:

- `BUILD_TARGET`: `development` または `production`
- `NODE_ENV`: `development` または `production`
- `FRONT_PORT`: ホスト側のポート番号
- `CONTAINER_PORT`: コンテナ内のポート番号
- `NGINX_PROFILE`: nginxコンテナを起動する場合は `dev`

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# 使用中のポートを確認
netstat -ano | findstr :3000

# または別のポートを使用
FRONT_PORT=3001 docker-compose up -d
```

### キャッシュをクリアして再ビルド

```bash
docker-compose build --no-cache
docker-compose up -d
```
