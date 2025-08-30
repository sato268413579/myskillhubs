from flask import Blueprint, request, jsonify
from flask_login import login_user, login_required, logout_user, current_user
import bcrypt
import json
import google.generativeai as genai
import os

from models.TrendSearchLog import TrendSearchLog
from config.db import db

trend_search_bp = Blueprint("trendSearch", __name__, url_prefix="/api/trendSearch")

# Gemini API Key を環境変数から読み込み
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Flask-Login 用: user_loader は app.py 側で login_manager に登録する
def load_user(user_id):
    return User.query.get(int(user_id))

@trend_search_bp.route("/", methods=["GET"])
def trendSearch():
    user_id = current_user.id

    trendSearchLogs = TrendSearchLog.query.filter_by(user_id=user_id).all()
    return jsonify([c.to_dict() for c in trendSearchLogs])


@trend_search_bp.route("/search", methods=["GET"])
def search():
    try:
        # クエリパラメータからトレンド取得
        trend = request.args.get("trend")
        if not trend:
            return jsonify({"error": "trend parameter is required"}), 400

        # サーバー側でプロンプト定義
        prompt = f"""
        あなたは最新トレンドの調査アシスタントです。
        指定されたテーマ「{trend}」に関する現在のトレンドや注目ポイントをわかりやすく整理し、
        JSON形式で以下のように返してください:

        {{
          "trend": "{trend}",
          "summary": "要約",
          "keywords": ["キーワード1", "キーワード2", "キーワード3"],
          "insights": ["具体的な洞察1", "具体的な洞察2"]
        }}
        """

        # モデルを初期化
        model = genai.GenerativeModel("gemini-1.5-flash")

        # リクエスト送信
        response = model.generate_content(prompt)

        # Geminiの返答（JSONテキスト）
        text = response.text

        # JSONとして返す（Geminiが正しくJSONを返さなかった場合のためにtry）
        try:
            parsed = json.loads(text)
            return jsonify(parsed)
        except Exception:
            # 万一JSONで返ってこなかった場合はそのまま返却
            return jsonify({"trend": trend, "raw_response": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
