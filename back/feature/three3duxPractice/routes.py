from flask import Blueprint, request, jsonify

three_d_bp = Blueprint("3d", __name__, url_prefix="/api/3d")

# 作成（基本情報＋タグ）
# POST /customers/create
@three_d_bp.route("/", methods=["POST"])
def index():
    """
    ユーザー意図に応じてメニューの座標を返す
    本来はAIで判断するが、PoCでは固定ロジック
    """
    data = request.json
    intent = data.get("intent", "default")

    # 仮のロジック
    if intent == "report":
        menus = [
            {"name": "Report Generator", "x": 0, "y": 0, "z": -2},
            {"name": "Dashboard", "x": 2, "y": 1, "z": -5},
            {"name": "Settings", "x": -2, "y": -1, "z": -8}
        ]
    else:
        menus = [
            {"name": "Home", "x": 0, "y": 0, "z": -2},
            {"name": "Profile", "x": 3, "y": 2, "z": -6},
            {"name": "Help", "x": -3, "y": -2, "z": -7}
        ]

    return jsonify({"menus": menus})