# MySQL文字化け・タイムゾーン対策

## 1. コンテナの再起動
```bash
cd back
docker-compose down
docker-compose up -d
```

## 2. MySQLクライアントでの接続方法

### 文字化けを防ぐ接続コマンド
```bash
# コンテナ内でmysqlクライアントを使用
docker exec -it <container_name> mysql -u root -p --default-character-set=utf8mb4

# または外部から接続
mysql -h localhost -P 3306 -u root -p --default-character-set=utf8mb4
```

### 接続後の設定確認
```sql
-- 文字セット確認
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- タイムゾーン確認
SHOW VARIABLES LIKE 'time_zone';

-- 既存データの確認
SELECT * FROM trend_search_log ORDER BY created_at DESC LIMIT 5;
```

## 3. 既存データの修正（必要に応じて）

既存のデータがUTCで保存されている場合、以下のクエリで日本時間に変換：

```sql
-- 9時間追加してJSTに変換
UPDATE trend_search_log 
SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
    updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR);

UPDATE deals 
SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);

UPDATE contacts 
SET contact_date = DATE_ADD(contact_date, INTERVAL 9 HOUR);
```

## 4. 環境変数での設定（オプション）
```bash
export MYSQL_PWD=example
export LC_ALL=ja_JP.UTF-8
```