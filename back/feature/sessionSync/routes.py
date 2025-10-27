from flask import Blueprint, request, jsonify, session
from flask_login import login_required, current_user
import requests
import json
from datetime import datetime, timedelta

session_sync_bp = Blueprint('session_sync', __name__, url_prefix='/api')

# デバッグ用テストエンドポイント
@session_sync_bp.route('/test', methods=['GET'])
def test_endpoint():
    """
    APIが正しく動作しているかテストするエンドポイント
    """
    return jsonify({
        'success': True,
        'message': 'Session Sync API is working!',
        'timestamp': datetime.now().isoformat()
    })

# Webアプリのセッション情報を管理するための簡易ストレージ
# 実際の実装では、データベースやRedisなどを使用
webapp_sessions = {}

@session_sync_bp.route('/sync-session/<app_id>', methods=['POST'])
def sync_session(app_id):
    """
    指定されたWebアプリとのセッション同期を行う
    """
    try:
        # テスト用: 認証をバイパス（実際の実装では@login_requiredを使用）
        user_id = getattr(current_user, 'id', 'test_user')
        
        # サポートされているWebアプリの定義
        supported_apps = {
            'gmail': {
                'name': 'Gmail',
                'auth_url': 'https://accounts.google.com/oauth2/auth',
                'token_url': 'https://oauth2.googleapis.com/token',
                'scope': 'https://www.googleapis.com/auth/gmail.readonly'
            },
            'github': {
                'name': 'GitHub',
                'auth_url': 'https://github.com/login/oauth/authorize',
                'token_url': 'https://github.com/login/oauth/access_token',
                'scope': 'user:email'
            },
            'notion': {
                'name': 'Notion',
                'auth_url': 'https://api.notion.com/v1/oauth/authorize',
                'token_url': 'https://api.notion.com/v1/oauth/token',
                'scope': 'read'
            },
            'slack': {
                'name': 'Slack',
                'auth_url': 'https://slack.com/oauth/v2/authorize',
                'token_url': 'https://slack.com/api/oauth.v2.access',
                'scope': 'users:read'
            }
        }
        
        if app_id not in supported_apps:
            return jsonify({
                'success': False,
                'error': f'Unsupported app: {app_id}'
            }), 400
        
        app_config = supported_apps[app_id]
        
        # 既存のセッション情報をチェック
        session_key = f"{user_id}_{app_id}"
        existing_session = webapp_sessions.get(session_key)
        
        if existing_session and existing_session.get('expires_at', 0) > datetime.now().timestamp():
            # 有効なセッションが存在する場合
            return jsonify({
                'success': True,
                'message': f'{app_config["name"]}のセッションは既に同期されています',
                'session_info': {
                    'app_id': app_id,
                    'app_name': app_config['name'],
                    'authenticated': True,
                    'synced_at': existing_session.get('synced_at'),
                    'expires_at': existing_session.get('expires_at')
                }
            })
        
        # 新しいセッション同期を実行（模擬的な処理）
        # 実際の実装では、OAuth2フローやAPIキー認証などを使用
        
        # 模擬的なセッション情報を作成
        session_info = {
            'app_id': app_id,
            'app_name': app_config['name'],
            'authenticated': True,
            'synced_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=24)).timestamp(),
            'access_token': f'mock_token_{app_id}_{user_id}',  # 実際の実装では暗号化して保存
            'user_info': {
                'email': getattr(current_user, 'email', 'test@example.com'),
                'name': getattr(current_user, 'username', 'Test User')
            }
        }
        
        # セッション情報を保存
        webapp_sessions[session_key] = session_info
        
        return jsonify({
            'success': True,
            'message': f'{app_config["name"]}のセッション同期が完了しました',
            'session_info': session_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'セッション同期中にエラーが発生しました: {str(e)}'
        }), 500

@session_sync_bp.route('/session-status/<app_id>', methods=['GET'])
def get_session_status(app_id):
    """
    指定されたWebアプリのセッション状態を取得
    """
    try:
        user_id = getattr(current_user, 'id', 'test_user')
        session_key = f"{user_id}_{app_id}"
        session_info = webapp_sessions.get(session_key)
        
        if not session_info:
            return jsonify({
                'authenticated': False,
                'app_id': app_id,
                'message': 'セッション情報が見つかりません'
            })
        
        # セッションの有効期限をチェック
        if session_info.get('expires_at', 0) <= datetime.now().timestamp():
            # 期限切れのセッションを削除
            del webapp_sessions[session_key]
            return jsonify({
                'authenticated': False,
                'app_id': app_id,
                'message': 'セッションの有効期限が切れています'
            })
        
        return jsonify({
            'authenticated': True,
            'app_id': app_id,
            'app_name': session_info.get('app_name'),
            'synced_at': session_info.get('synced_at'),
            'expires_at': session_info.get('expires_at'),
            'user_info': session_info.get('user_info')
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'セッション状態の取得中にエラーが発生しました: {str(e)}'
        }), 500

@session_sync_bp.route('/revoke-session/<app_id>', methods=['DELETE'])
def revoke_session(app_id):
    """
    指定されたWebアプリのセッションを無効化
    """
    try:
        user_id = getattr(current_user, 'id', 'test_user')
        session_key = f"{user_id}_{app_id}"
        
        if session_key in webapp_sessions:
            del webapp_sessions[session_key]
            return jsonify({
                'success': True,
                'message': f'{app_id}のセッションを無効化しました'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'セッション情報が見つかりません'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'セッション無効化中にエラーが発生しました: {str(e)}'
        }), 500

@session_sync_bp.route('/webapp-proxy/<app_id>', methods=['GET', 'POST'])
def webapp_proxy(app_id):
    """
    Webアプリへのプロキシリクエスト（セッション情報を含む）
    """
    try:
        user_id = getattr(current_user, 'id', 'test_user')
        session_key = f"{user_id}_{app_id}"
        session_info = webapp_sessions.get(session_key)
        
        if not session_info or session_info.get('expires_at', 0) <= datetime.now().timestamp():
            return jsonify({
                'success': False,
                'error': '認証が必要です'
            }), 401
        
        # 実際の実装では、各Webアプリの API に対してプロキシリクエストを送信
        # ここでは模擬的なレスポンスを返す
        
        mock_responses = {
            'gmail': {
                'unread_count': 5,
                'recent_emails': [
                    {'subject': '重要なお知らせ', 'sender': 'info@example.com'},
                    {'subject': 'プロジェクト更新', 'sender': 'team@company.com'}
                ]
            },
            'github': {
                'notifications': 3,
                'recent_repos': [
                    {'name': 'my-project', 'stars': 12},
                    {'name': 'another-repo', 'stars': 5}
                ]
            },
            'notion': {
                'recent_pages': [
                    {'title': 'プロジェクト計画', 'updated': '2024-01-15'},
                    {'title': 'ミーティングノート', 'updated': '2024-01-14'}
                ]
            },
            'slack': {
                'unread_messages': 8,
                'active_channels': ['general', 'development', 'random']
            }
        }
        
        return jsonify({
            'success': True,
            'app_id': app_id,
            'data': mock_responses.get(app_id, {}),
            'session_info': {
                'authenticated': True,
                'user_info': session_info.get('user_info')
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'プロキシリクエスト中にエラーが発生しました: {str(e)}'
        }), 500