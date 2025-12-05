#!/bin/bash
# 全マイグレーションを順番に実行
# 使い方: ./run-all-migrations.sh

echo "🚀 全マイグレーションを実行します"
echo "========================================"

# マイグレーションファイルのリスト（実行順）
MIGRATIONS=(
    "create_construction_schedule_tables.sql"
    "add_user_id_to_projects.sql"
    "create_user_services_tables.sql"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for migration in "${MIGRATIONS[@]}"; do
    echo ""
    echo "📝 実行中: $migration"
    echo "----------------------------------------"
    
    if [ -f "migrations/$migration" ]; then
        docker exec -i db mysql -uroot -pexample myapp < "migrations/$migration"
        
        if [ $? -eq 0 ]; then
            echo "✅ 成功: $migration"
            ((SUCCESS_COUNT++))
        else
            echo "❌ 失敗: $migration"
            ((FAIL_COUNT++))
        fi
    else
        echo "⚠️  スキップ: $migration (ファイルが見つかりません)"
    fi
done

echo ""
echo "========================================"
echo "📊 マイグレーション結果"
echo "  成功: $SUCCESS_COUNT"
echo "  失敗: $FAIL_COUNT"
echo "========================================"

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✅ 全てのマイグレーションが完了しました！"
    exit 0
else
    echo "❌ 一部のマイグレーションが失敗しました"
    exit 1
fi
