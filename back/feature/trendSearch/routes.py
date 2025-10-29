from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
import json

from models.TrendSearchLog import TrendSearchLog
from models.User import User
from config.db import db

# search.pyから検索関数をインポート
from .search import execute_full_search, get_search_health_status

trend_search_bp = Blueprint("trendSearch", __name__, url_prefix="/api/trendSearch")

# Flask-Login用
def load_user(user_id):
    return User.query.get(int(user_id))

@trend_search_bp.route("/search", methods=["GET"])
@login_required
def search():
    """
    メインの検索エンドポイント
    search.pyのexecute_full_search関数を呼び出し
    """
    try:
        # リクエストパラメータの取得
        trend = request.args.get("trend")
        if not trend:
            return jsonify({"error": "trend parameter is required"}), 400
        
        trend = trend.strip()
        if not trend:
            return jsonify({"error": "trend cannot be empty"}), 400
        
        # search.pyの関数を呼び出し
        result = execute_full_search(trend)
        
        # データベースへの保存（認証済みユーザーの場合）
        print('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        if current_user.is_authenticated:
            print('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
            try:
                trend_log = TrendSearchLog(
                    user_id=current_user.id,
                    trend=trend,
                    result=json.dumps(result, ensure_ascii=False)
                )
                db.session.add(trend_log)
                db.session.commit()
                print("✅ Research result saved to database")
            except Exception as db_error:
                print(f"⚠️ Database save error: {db_error}")
                # データベースエラーでも検索結果は返す
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Search endpoint error: {e}")
        return jsonify({
            "error": "検索中にエラーが発生しました",
            "details": str(e),
            "trend": trend if 'trend' in locals() else 'Unknown'
        }), 500

@trend_search_bp.route("/health", methods=["GET"])
@login_required
def health_check():
    """
    ヘルスチェックエンドポイント
    search.pyのget_search_health_status関数を呼び出し
    """
    try:
        # search.pyの関数を呼び出し
        status = get_search_health_status()
        return jsonify(status)
        
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return jsonify({
            "service": "LangGraph AI Knowledge Research Assistant",
            "status": "error",
            "error": str(e)
        }), 500