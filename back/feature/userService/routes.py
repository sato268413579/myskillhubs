"""
ユーザーサービス管理のルート
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models.user_service import UserService, UserRole
from config.db import db

user_service_bp = Blueprint('user_service', __name__, url_prefix='/api/user-services')

# 利用可能なサービス定義
AVAILABLE_SERVICES = {
    'tasks': {
        'id': 'tasks',
        'name': 'タスク管理ツール',
        'description': 'シンプルで使いやすいタスク管理アプリです。',
        'icon': '📝',
        'path': '/service/tasks',
        'tags': ['管理', 'Todo', '効率化']
    },
    'crm': {
        'id': 'crm',
        'name': 'CRM（顧客管理）',
        'description': '顧客情報を一元管理し、営業活動を効率化します。',
        'icon': '👥',
        'path': '/service/crm',
        'tags': ['顧客', '営業支援', '管理']
    },
    'aiSearch': {
        'id': 'aiSearch',
        'name': 'AI情報収集',
        'description': 'AIによる各分野の情報収集を取得',
        'icon': '🤖',
        'path': '/service/aiSearch',
        'tags': ['検索', 'トレンド支援', '効率化']
    },
    'construction-schedule': {
        'id': 'construction-schedule',
        'name': '工事工程管理',
        'description': '工事プロジェクトの工程をガントチャートで管理',
        'icon': '🏗️',
        'path': '/service/construction-schedule',
        'tags': ['工程管理', 'ガントチャート', '建設']
    },
    '3d': {
        'id': '3d',
        'name': '3D可視化メニュー',
        'description': '3Dによる新しいWebアプリ',
        'icon': '🎨',
        'path': '/service/3d',
        'tags': ['革新', '新規']
    }
}


@user_service_bp.route('/my-services', methods=['GET'])
@login_required
def get_my_services():
    """ログインユーザーが利用可能なサービス一覧を取得"""
    try:
        # ユーザーのサービス権限を取得
        user_services = UserService.query.filter_by(
            user_id=current_user.id,
            is_enabled=True
        ).all()
        
        # サービスIDのリストを取得
        enabled_service_ids = [us.service_id for us in user_services]
        
        # 利用可能なサービス情報を構築
        services = []
        for service_id in enabled_service_ids:
            if service_id in AVAILABLE_SERVICES:
                service_info = AVAILABLE_SERVICES[service_id].copy()
                service_info['status'] = 'active'
                services.append(service_info)
        
        return jsonify({
            'success': True,
            'services': services,
            'total_count': len(services)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/all-services', methods=['GET'])
@login_required
def get_all_services():
    """全サービス一覧とユーザーの利用状況を取得（管理者用）"""
    try:
        # ユーザーロールをチェック（将来実装）
        # 現在は全ユーザーが自分のサービス状況を確認可能
        
        # ユーザーのサービス権限を取得
        user_services = UserService.query.filter_by(user_id=current_user.id).all()
        user_service_map = {us.service_id: us.is_enabled for us in user_services}
        
        # 全サービス情報を構築
        services = []
        for service_id, service_info in AVAILABLE_SERVICES.items():
            service_data = service_info.copy()
            service_data['is_enabled'] = user_service_map.get(service_id, False)
            service_data['status'] = 'active' if user_service_map.get(service_id, False) else 'disabled'
            services.append(service_data)
        
        return jsonify({
            'success': True,
            'services': services,
            'total_count': len(services)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/enable/<service_id>', methods=['POST'])
@login_required
def enable_service(service_id):
    """サービスを有効化（管理者またはユーザー自身）"""
    try:
        # サービスIDの検証
        if service_id not in AVAILABLE_SERVICES:
            return jsonify({'success': False, 'error': '無効なサービスIDです'}), 400
        
        # 既存のレコードを確認
        user_service = UserService.query.filter_by(
            user_id=current_user.id,
            service_id=service_id
        ).first()
        
        if user_service:
            # 既存レコードを有効化
            user_service.is_enabled = True
        else:
            # 新規レコードを作成
            user_service = UserService(
                user_id=current_user.id,
                service_id=service_id,
                is_enabled=True
            )
            db.session.add(user_service)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{AVAILABLE_SERVICES[service_id]["name"]}を有効化しました',
            'service': user_service.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/disable/<service_id>', methods=['POST'])
@login_required
def disable_service(service_id):
    """サービスを無効化（管理者またはユーザー自身）"""
    try:
        # サービスIDの検証
        if service_id not in AVAILABLE_SERVICES:
            return jsonify({'success': False, 'error': '無効なサービスIDです'}), 400
        
        # 既存のレコードを確認
        user_service = UserService.query.filter_by(
            user_id=current_user.id,
            service_id=service_id
        ).first()
        
        if user_service:
            user_service.is_enabled = False
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'{AVAILABLE_SERVICES[service_id]["name"]}を無効化しました',
                'service': user_service.to_dict()
            })
        else:
            return jsonify({'success': False, 'error': 'サービスが見つかりません'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/check/<service_id>', methods=['GET'])
@login_required
def check_service_access(service_id):
    """特定のサービスへのアクセス権をチェック"""
    try:
        user_service = UserService.query.filter_by(
            user_id=current_user.id,
            service_id=service_id,
            is_enabled=True
        ).first()
        
        has_access = user_service is not None
        
        return jsonify({
            'success': True,
            'service_id': service_id,
            'has_access': has_access,
            'service_name': AVAILABLE_SERVICES.get(service_id, {}).get('name', 'Unknown')
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/my-role', methods=['GET'])
@login_required
def get_my_role():
    """ログインユーザーのロールを取得"""
    try:
        user_role = UserRole.query.filter_by(user_id=current_user.id).first()
        
        if user_role:
            return jsonify({
                'success': True,
                'role': user_role.role,
                'role_info': user_role.to_dict()
            })
        else:
            # デフォルトロール
            return jsonify({
                'success': True,
                'role': 'user',
                'role_info': None
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@user_service_bp.route('/test', methods=['GET'])
def test_endpoint():
    """テスト用エンドポイント"""
    return jsonify({
        'success': True,
        'message': 'User Service API is working!',
        'available_services': list(AVAILABLE_SERVICES.keys())
    })
