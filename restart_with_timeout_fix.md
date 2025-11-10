# タイムアウト設定適用手順

## 1. コンテナの再起動
```bash
# バックエンド
cd back
docker-compose down
docker-compose up -d --build

# フロントエンド（Nginx含む）
cd ../front
docker-compose down
docker-compose up -d --build
```

## 2. 設定変更内容

### Nginx (5分タイムアウト)
- proxy_connect_timeout: 300s
- proxy_send_timeout: 300s  
- proxy_read_timeout: 300s
- send_timeout: 300s

### Gunicorn (5分タイムアウト)
- --timeout 300
- --workers 1 --threads 2

### フロントエンド (5分タイムアウト)
- AbortController使用
- 300秒でタイムアウト
- エラーメッセージ改善

## 3. 確認方法
```bash
# コンテナ状態確認
docker ps

# ログ確認
docker logs api
docker logs nginx
```

## 4. 2段階分析の処理時間
- Phase 1: 30-60秒（基本分析）
- Phase 2: 60-180秒（詳細分析）
- 合計: 2-5分程度