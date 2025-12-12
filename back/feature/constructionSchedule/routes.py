"""
工事工程管理機能のルート
"""
import os
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from models.construction_schedule import Project, Milestone, MilestoneHistory
from config.db import db
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
from google.oauth2 import service_account
from google.cloud import aiplatform

construction_schedule_bp = Blueprint('construction_schedule', __name__, url_prefix='/api/construction-schedule')


# ==================== プロジェクト管理API ====================

@construction_schedule_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    """プロジェクト一覧取得（ログインユーザーのみ）"""
    try:
        # ログインユーザーのプロジェクトのみ取得
        projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
        return jsonify({
            'success': True,
            'projects': [p.to_dict() for p in projects]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    """プロジェクト作成（ログインユーザーに紐付け）"""
    try:
        data = request.get_json()
        
        project = Project(
            user_id=current_user.id,  # ログインユーザーIDを設定
            name=data.get('name'),
            description=data.get('description'),
            client_name=data.get('client_name'),
            site_location=data.get('site_location'),
            start_date=datetime.fromisoformat(data['start_date']).date() if data.get('start_date') else None,
            end_date=datetime.fromisoformat(data['end_date']).date() if data.get('end_date') else None,
            status=data.get('status', 'planning')
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'プロジェクトを作成しました',
            'project': project.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def get_project(project_id):
    """プロジェクト詳細取得（アクセス権チェック）"""
    try:
        project = Project.query.get_or_404(project_id)
        
        # アクセス権チェック：自分のプロジェクトのみアクセス可能
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        milestones = Milestone.query.filter_by(project_id=project_id).order_by(Milestone.display_order).all()
        
        return jsonify({
            'success': True,
            'project': project.to_dict(),
            'milestones': [m.to_dict() for m in milestones]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/projects/<int:project_id>', methods=['PUT'])
@login_required
def update_project(project_id):
    """プロジェクト更新（アクセス権チェック）"""
    try:
        project = Project.query.get_or_404(project_id)
        
        # アクセス権チェック
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        data = request.get_json()
        
        if 'name' in data:
            project.name = data['name']
        if 'description' in data:
            project.description = data['description']
        if 'client_name' in data:
            project.client_name = data['client_name']
        if 'site_location' in data:
            project.site_location = data['site_location']
        if 'start_date' in data:
            project.start_date = datetime.fromisoformat(data['start_date']).date() if data['start_date'] else None
        if 'end_date' in data:
            project.end_date = datetime.fromisoformat(data['end_date']).date() if data['end_date'] else None
        if 'status' in data:
            project.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'プロジェクトを更新しました',
            'project': project.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    """プロジェクト削除（アクセス権チェック）"""
    try:
        project = Project.query.get_or_404(project_id)
        
        # アクセス権チェック
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'プロジェクトを削除しました'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== 工程管理API ====================

@construction_schedule_bp.route('/projects/<int:project_id>/milestones', methods=['GET'])
@login_required
def get_milestones(project_id):
    """工程一覧取得（アクセス権チェック）"""
    try:
        # プロジェクトのアクセス権チェック
        project = Project.query.get_or_404(project_id)
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        milestones = Milestone.query.filter_by(project_id=project_id).order_by(Milestone.display_order).all()
        
        return jsonify({
            'success': True,
            'milestones': [m.to_dict() for m in milestones]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/projects/<int:project_id>/milestones/gantt', methods=['GET'])
@login_required
def get_milestones_gantt(project_id):
    """ガントチャート用工程データ取得（アクセス権チェック）"""
    try:
        # プロジェクトのアクセス権チェック
        project = Project.query.get_or_404(project_id)
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        milestones = Milestone.query.filter_by(project_id=project_id).order_by(Milestone.display_order).all()
        
        return jsonify({
            'success': True,
            'tasks': [m.to_gantt_format() for m in milestones]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/milestones', methods=['POST'])
@login_required
def create_milestone():
    """工程作成（アクセス権チェック）"""
    try:
        data = request.get_json()
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get_or_404(data['project_id'])
        if project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        # 最大display_orderを取得
        max_order = db.session.query(db.func.max(Milestone.display_order)).filter_by(
            project_id=data['project_id']
        ).scalar() or 0
        
        milestone = Milestone(
            project_id=data['project_id'],
            name=data['name'],
            description=data.get('description'),
            start_date=datetime.fromisoformat(data['start_date']),
            end_date=datetime.fromisoformat(data['end_date']),
            display_order=max_order + 1,
            status=data.get('status', 'not_started'),
            progress_percentage=data.get('progress_percentage', 0),
            assigned_to=data.get('assigned_to'),
            color=data.get('color', '#3B82F6'),
            notes=data.get('notes')
        )
        
        db.session.add(milestone)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '工程を作成しました',
            'milestone': milestone.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/milestones/<int:milestone_id>', methods=['GET'])
@login_required
def get_milestone(milestone_id):
    """工程詳細取得（アクセス権チェック）"""
    try:
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get(milestone.project_id)
        if not project or project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        return jsonify({
            'success': True,
            'milestone': milestone.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/milestones/<int:milestone_id>', methods=['PUT'])
@login_required
def update_milestone(milestone_id):
    """工程更新（ドラッグ&ドロップ時も使用、アクセス権チェック）"""
    try:
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get(milestone.project_id)
        if not project or project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        data = request.get_json()
        
        # 変更履歴記録用
        changes = []
        
        if 'name' in data and milestone.name != data['name']:
            changes.append(('name', milestone.name, data['name']))
            milestone.name = data['name']
        
        if 'description' in data:
            milestone.description = data['description']
        
        if 'start_date' in data:
            new_start = datetime.fromisoformat(data['start_date'])
            if milestone.start_date != new_start:
                changes.append(('start_date', milestone.start_date.isoformat(), new_start.isoformat()))
                milestone.start_date = new_start
        
        if 'end_date' in data:
            new_end = datetime.fromisoformat(data['end_date'])
            if milestone.end_date != new_end:
                changes.append(('end_date', milestone.end_date.isoformat(), new_end.isoformat()))
                milestone.end_date = new_end
        
        if 'status' in data and milestone.status != data['status']:
            changes.append(('status', milestone.status, data['status']))
            milestone.status = data['status']
        
        if 'progress_percentage' in data and milestone.progress_percentage != data['progress_percentage']:
            changes.append(('progress_percentage', str(milestone.progress_percentage), str(data['progress_percentage'])))
            milestone.progress_percentage = data['progress_percentage']
        
        if 'assigned_to' in data:
            milestone.assigned_to = data['assigned_to']
        
        if 'color' in data:
            milestone.color = data['color']
        
        if 'notes' in data:
            milestone.notes = data['notes']
        
        db.session.commit()
        
        # 変更履歴を記録
        username = getattr(current_user, 'username', 'unknown')
        for field_name, old_value, new_value in changes:
            history = MilestoneHistory(
                milestone_id=milestone_id,
                field_name=field_name,
                old_value=old_value,
                new_value=new_value,
                changed_by=username
            )
            db.session.add(history)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '工程を更新しました',
            'milestone': milestone.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/milestones/<int:milestone_id>', methods=['DELETE'])
@login_required
def delete_milestone(milestone_id):
    """工程削除（アクセス権チェック）"""
    try:
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get(milestone.project_id)
        if not project or project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        db.session.delete(milestone)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '工程を削除しました'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@construction_schedule_bp.route('/milestones/<int:milestone_id>/reorder', methods=['PUT'])
@login_required
def reorder_milestone(milestone_id):
    """表示順序変更（アクセス権チェック）"""
    try:
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get(milestone.project_id)
        if not project or project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        data = request.get_json()
        
        milestone.display_order = data['display_order']
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '表示順序を変更しました'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== 変更履歴API ====================

@construction_schedule_bp.route('/milestones/<int:milestone_id>/history', methods=['GET'])
@login_required
def get_milestone_history(milestone_id):
    """工程変更履歴取得（アクセス権チェック）"""
    try:
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # プロジェクトのアクセス権チェック
        project = Project.query.get(milestone.project_id)
        if not project or project.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'アクセス権限がありません'}), 403
        
        history = MilestoneHistory.query.filter_by(milestone_id=milestone_id).order_by(
            MilestoneHistory.changed_at.desc()
        ).all()
        
        return jsonify({
            'success': True,
            'history': [h.to_dict() for h in history]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# Gemini クライアント初期化（Vertex AI 用）
# ============================================
def init_gemini_vertex(
    project_id: str,
    location: str,
    service_account_json: str
):
    # サービスアカウント読み込み
    credentials = service_account.Credentials.from_service_account_file(
        service_account_json,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

    # Cloud (Vertex AI) モードで初期化
    client = Client(
        vertexai=True,
        project=project_id,
        location=location,
        credentials=credentials
    )

    return client


# ============================================
# Gemini へテキストプロンプト送信
# ============================================
@construction_schedule_bp.route('/call_gemini', methods=['POST'])
@login_required
def call_gemini():
    data = request.get_json()
    project = data["project"]
    milestones = data["milestones"]

    # required = ['assigned_to', 'name', 'description']
    # if not all(key in data for key in required):
    #     return jsonify({
    #         'success': True,
    #         "message": '必須パラメータが足りません。'
    #     })

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SA_KEY_PATH = os.path.join(BASE_DIR, "..", "..", "config", "service-account.json")
    SA_KEY_PATH = os.path.abspath(SA_KEY_PATH)

    credentials = service_account.Credentials.from_service_account_file(
        SA_KEY_PATH,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

    client = genai.Client(
        vertexai=True,   # Vertex AI 経由
        project=os.environ["GCP_PROJECT"],
        location=os.environ["GCP_LOCATION"],
        credentials=credentials
    )
    project_info = f"""
■プロジェクト情報
- 名称: {project['name']}
- 概要: {project['description']}
"""

    milestones_text = ""
    for i, m in enumerate(milestones, start=1):
        milestones_text += f"""
{i}. {m.get('name', '名称なし')}
   説明: {m.get('description', '')}
   期間: {m.get('start_date', '')} 〜 {m.get('end_date', '')}
   進捗: {m.get('progress_percentage', '0')}%
   担当: {m.get('assigned_to', '未割当')}
"""

    prompt = f"""
あなたは建設系クライアント向けにAI導入提案資料をつくる専門コンサルタントです。

【出力ルール】
- 重要なポイントを “最大4セクション” にまとめる
- 各セクションは以下の4要素だけを書く：
  ① 一言タイトル  
  ② 効果（数字必須）  
  ③ 実際に何ができるか（3〜4つ以内）  
  ④ 導入ハードル（短く）
- 箇条書きは最大4つまで
- 専門用語よりも読みやすさ優先
- 新規事業の役員に説明する前提で簡潔に
- 全体の文章量は 600〜900文字以内
- 表や区切り線などを使わず、シンプルな見た目にする

---

【プロジェクト情報】
{project_info}

【マイルストーン一覧】
{milestones_text}
---

建設現場の実運用を意識し、
「どこに AI を入れると工数が一番削減できるか」を実務者視点で分析してください。
"""

    # result = llm.invoke(prompt)
    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return jsonify({
        'success': True,
        "message": result.text
    })


# ==================== テスト用エンドポイント ====================

@construction_schedule_bp.route('/test', methods=['GET'])
def test_endpoint():
    """テスト用エンドポイント"""
    return jsonify({
        'success': True,
        'message': 'Construction Schedule API is working!',
        'timestamp': datetime.now().isoformat()
    })
