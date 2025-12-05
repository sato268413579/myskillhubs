# マイグレーション実行ガイド

## 概要
このディレクトリには、データベースマイグレーションスクリプトが含まれています。

## マイグレーションファイル

### 1. `create_construction_schedule_tables.sql`
工事工程管理機能のテーブルを作成
- projects
- milestones
- milestone_dependencies
- milestone_history

### 2. `add_user_id_to_projects.sql`
projectsテーブルにuser_idカラムを追加（ユーザーごとのアクセス制御）

### 3. `create_user_services_tables.sql`
ユーザーサービス管理テーブルを作成
- user_services
- user_roles

## マイグレーション実行方法

### 方法1: 個別実行（推奨）

```bash
# 実行権限を付与（初回のみ）
chmod +x run-migration.sh

# 個別のマイグレーションを実行
./run-migration.sh create_construction_schedule_tables.sql
./run-migration.sh add_user_id_to_projects.sql
./run-migration.sh create_user_services_tables.sql
```

### 方法2: 一括実行

```bash
# 実行権限を付与（初回のみ）
chmod +x run-all-migrations.sh

# 全マイグレーションを順番に実行
./run-all-migrations.sh
```

### 方法3: 手動実行（Dockerコンテナ経由）

```bash
# DBコンテナに接続
docker exec -it db mysql -uroot -pexample myapp

# または、ファイルを直接実行
docker exec -i db mysql -uroot -pexample myapp < migrations/create_construction_schedule_tables.sql
```

### 方法4: ホストから直接実行（MySQLクライアントがインストールされている場合）

```bash
mysql -h localhost -P 3306 -uroot -pexample myapp < migrations/create_construction_schedule_tables.sql
```

## トラブルシューティング

### エラー: "Table already exists"
テーブルが既に存在する場合は、スキップされます（`CREATE TABLE IF NOT EXISTS`を使用）。

### エラー: "Cannot connect to database"
1. Dockerコンテナが起動しているか確認
   ```bash
   docker ps
   ```

2. DBコンテナを再起動
   ```bash
   docker-compose restart db
   ```

### エラー: "Permission denied"
スクリプトに実行権限を付与
```bash
chmod +x run-migration.sh run-all-migrations.sh
```

## マイグレーションの確認

### テーブル一覧を確認
```bash
docker exec -it db mysql -uroot -pexample myapp -e "SHOW TABLES;"
```

### 特定のテーブル構造を確認
```bash
docker exec -it db mysql -uroot -pexample myapp -e "DESCRIBE projects;"
docker exec -it db mysql -uroot -pexample myapp -e "DESCRIBE user_services;"
```

### データを確認
```bash
docker exec -it db mysql -uroot -pexample myapp -e "SELECT * FROM user_services;"
```

## 注意事項

1. **本番環境では慎重に実行してください**
   - 必ずバックアップを取得してから実行
   - テスト環境で事前に検証

2. **マイグレーションの順序**
   - 依存関係があるため、上記の順番で実行してください

3. **ロールバック**
   - 現在、自動ロールバック機能はありません
   - 必要に応じて手動でテーブルを削除してください

## マイグレーションファイルの場所

```
back/
├── migrations/
│   ├── create_construction_schedule_tables.sql
│   ├── add_user_id_to_projects.sql
│   └── create_user_services_tables.sql
├── run-migration.sh
├── run-all-migrations.sh
└── README_MIGRATIONS.md
```

## Docker Composeの設定

`docker-compose.yml`でmigrationsフォルダがマウントされています:

```yaml
volumes:
  - ./migrations:/docker-entrypoint-initdb.d/migrations:ro
```

これにより、DBコンテナ内から`/docker-entrypoint-initdb.d/migrations/`でマイグレーションファイルにアクセスできます。
