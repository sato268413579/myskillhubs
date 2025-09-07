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
        trend = request.args.get("trend")
        if not trend:
            return jsonify({"error": "trend parameter is required"}), 400

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

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        text = response.text.strip()

        # ✅ コードブロックがついていたら除去
        if text.startswith("```"):
            text = text.strip("`")            # バッククォート除去
            # "json\n{...}" 形式の場合は json\n を削る
            if text.startswith("json"):
                text = text[len("json"):].strip()

        try:
            parsed = json.loads(text)
            return jsonify(parsed)
        except Exception:
            return jsonify({"trend": trend, "raw_response": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

