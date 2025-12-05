#!/bin/bash
# マイグレーションスクリプト実行用ヘルパー
# 使い方: ./run-migration.sh <migration-file.sql>

if [ -z "$1" ]; then
    echo "使い方: ./run-migration.sh <migration-file.sql>"
    echo ""
    echo "利用可能なマイグレーション:"
    ls -1 migrations/*.sql
    exit 1
fi

MIGRATION_FILE=$1

if [ ! -f "migrations/$MIGRATION_FILE" ]; then
    echo "エラー: migrations/$MIGRATION_FILE が見つかりません"
    exit 1
fi

echo "マイグレーションを実行します: $MIGRATION_FILE"
echo "----------------------------------------"

# Docker コンテナ内でマイグレーションを実行
docker exec -i db mysql -uroot -pexample myapp < "migrations/$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "----------------------------------------"
    echo "✅ マイグレーション完了: $MIGRATION_FILE"
else
    echo "----------------------------------------"
    echo "❌ マイグレーション失敗: $MIGRATION_FILE"
    exit 1
fi
