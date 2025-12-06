# デプロイメントガイド

## 開発環境

開発環境では、ホットリロード機能付きの開発サーバーを使用します。

```bash
# 起動
docker-compose up -d

# 停止
docker-compose down
```

- フロントエンド: http://localhost:3000
- Nginx経由: http://localhost

## 本番環境（AWS等）

本番環境では、ビルドした静的ファイルをNginxで配信します。

```bash
# ビルドと起動
docker-compose -f docker-compose.prod.yml up -d --build

# 停止
docker-compose -f docker-compose.prod.yml down
```

- アクセス: http://localhost (ポート80)

### 本番環境の特徴
- マルチステージビルドで最適化
- 静的ファイルをNginxで高速配信
- 開発用の依存関係を含まない軽量イメージ
- "Invalid Host header"エラーが発生しない

## トラブルシューティング

### "Invalid Host header"エラー
- 開発環境: `.env`に`DANGEROUSLY_DISABLE_HOST_CHECK=true`を追加
- 本番環境: `docker-compose.prod.yml`を使用（開発サーバーを使わない）

### コンテナが起動しない
```bash
# ログを確認
docker-compose logs front
docker-compose logs nginx

# コンテナを再ビルド
docker-compose up -d --build
```

### ネットワークエラー
```bash
# mynetworkが存在するか確認
docker network ls

# 存在しない場合は作成
docker network create mynetwork
```
