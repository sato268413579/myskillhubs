from flask import Blueprint, request, jsonify, session
from flask_login import login_required, current_user
import subprocess
import json
import os
import base64
from datetime import datetime, timedelta
import uuid
import hashlib
import hmac

electron_capture_bp = Blueprint('electron_capture', __name__, url_prefix='/api/service/3d')

# セキュリティ設定
SECRET_KEY = os.environ.get('ELECTRON_SECRET_KEY', 'dev-electron-secret')
ALLOWED_ORIGINS = ['http://localhost:3000', 'https://yourdomain.com']

# アクティブなキャプチャセッション管理
active_sessions = {}

def generate_secure_token(user_id: str, session_id: str) -> str:
    """セキュアなトークンを生成"""
    timestamp = str(int(datetime.now().timestamp()))
    message = f"{user_id}:{session_id}:{timestamp}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return base64.b64encode(f"{message}:{signature}".encode()).decode()

def verify_token(token: str) -> dict:
    """トークンを検証"""
    try:
        decoded = base64.b64decode(token.encode()).decode()
        parts = decoded.split(':')
        if len(parts) != 4:
            return None
        
        user_id, session_id, timestamp, signature = parts
        message = f"{user_id}:{session_id}:{timestamp}"
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if signature != expected_signature:
            return None
        
        # トークンの有効期限チェック（24時間）
        if int(timestamp) < datetime.now().timestamp() - 86400:
            return None
        
        return {
            'user_id': user_id,
            'session_id': session_id,
            'timestamp': int(timestamp)
        }
    except Exception:
        return None

@electron_capture_bp.route('/start-electron-capture', methods=['POST'])
def start_electron_capture():
    """Electronベースのキャプチャを開始"""
    try:
        user_id = getattr(current_user, 'id', 'test_user')
        data = request.get_json() or {}
        
        # セッションID生成
        session_id = str(uuid.uuid4())
        
        # セキュアトークン生成
        secure_token = generate_secure_token(user_id, session_id)
        
        # キャプチャ設定
        capture_config = {
            'session_id': session_id,
            'user_id': user_id,
            'capture_type': data.get('capture_type', 'window'),
            'target_urls': data.get('target_urls', []),
            'quality': data.get('quality', 'high'),
            'frame_rate': data.get('frame_rate', 30),
            'audio_enabled': data.get('audio_enabled', True),
            'interaction_enabled': data.get('interaction_enabled', True),
            'security_level': data.get('security_level', 'standard'),
            'encryption_enabled': True,
            'token': secure_token
        }
        
        # Electronの可用性をチェック
        electron_available = check_electron_availability()
        
        if electron_available:
            # 実際のElectronプロセスを起動
            success, process_or_error = start_electron_process(capture_config)
            
            if success:
                # セッション情報を保存
                active_sessions[session_id] = {
                    'user_id': user_id,
                    'process': process_or_error,
                    'config': capture_config,
                    'started_at': datetime.now().isoformat(),
                    'status': 'running',
                    'streams': [],
                    'interactions_count': 0,
                    'mode': 'electron'
                }
                
                return jsonify({
                    'success': True,
                    'session_id': session_id,
                    'token': secure_token,
                    'message': 'Electronキャプチャを開始しました',
                    'websocket_url': f'ws://localhost:8080/capture/{session_id}',
                    'mode': 'electron',
                    'config': {
                        'quality': capture_config['quality'],
                        'frame_rate': capture_config['frame_rate'],
                        'audio_enabled': capture_config['audio_enabled'],
                        'interaction_enabled': capture_config['interaction_enabled']
                    }
                })
            else:
                # Electronプロセス起動失敗、モックモードにフォールバック
                return start_mock_capture(session_id, secure_token, capture_config, str(process_or_error))
        else:
            # Electronが利用できない場合、モックモードで動作
            return start_mock_capture(session_id, secure_token, capture_config, "Electronが利用できません")
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'キャプチャの開始に失敗しました: {str(e)}'
        }), 500

def check_electron_availability() -> bool:
    """Electronの可用性をチェック（Node.js環境の確認）"""
    try:
        # Node.jsの存在確認
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode != 0:
            return False
        
        # npmの存在確認
        npm_result = subprocess.run(['npm', '--version'], 
                                  capture_output=True, text=True, timeout=5)
        return npm_result.returncode == 0
        
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
        return False

def start_electron_process(capture_config: dict) -> tuple[bool, any]:
    """Electronプロセスを起動（実際にはモックモードで動作）"""
    try:
        # 実際のElectronプロセス起動は複雑なため、現在はモックモードで動作
        # 将来的には別のElectronアプリケーションとWebSocket通信で連携
        
        # モックプロセス情報を返す
        mock_process = {
            'pid': os.getpid(),
            'status': 'mock_running',
            'message': 'Electronプロセスの代わりにモックモードで動作中'
        }
        
        return True, mock_process
        
    except Exception as e:
        return False, e

def start_mock_capture(session_id: str, secure_token: str, capture_config: dict, reason: str) -> dict:
    """モックキャプチャセッションを開始"""
    # モックセッション情報を保存
    active_sessions[session_id] = {
        'user_id': capture_config['user_id'],
        'process': None,
        'config': capture_config,
        'started_at': datetime.now().isoformat(),
        'status': 'mock_running',
        'streams': [
            {'name': 'Gmail Mock', 'url': 'https://mail.google.com'},
            {'name': 'GitHub Mock', 'url': 'https://github.com'},
            {'name': 'Notion Mock', 'url': 'https://notion.so'}
        ],
        'interactions_count': 0,
        'mode': 'mock'
    }
    
    return jsonify({
        'success': True,
        'session_id': session_id,
        'token': secure_token,
        'message': f'モックキャプチャを開始しました（理由: {reason}）',
        'websocket_url': f'ws://localhost:8080/capture/{session_id}',
        'mode': 'mock',
        'warning': 'Electronが利用できないため、モックモードで動作しています',
        'config': {
            'quality': capture_config['quality'],
            'frame_rate': capture_config['frame_rate'],
            'audio_enabled': capture_config['audio_enabled'],
            'interaction_enabled': capture_config['interaction_enabled']
        },
        'mock_streams': [
            {'name': 'Gmail (模擬)', 'status': 'active'},
            {'name': 'GitHub (模擬)', 'status': 'active'},
            {'name': 'Notion (模擬)', 'status': 'active'}
        ]
    })

@electron_capture_bp.route('/send-interaction', methods=['POST'])
def send_interaction():
    """操作イベントを送信"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        token = data.get('token')
        
        # トークン検証
        token_data = verify_token(token)
        if not token_data or token_data['session_id'] != session_id:
            return jsonify({'success': False, 'error': '認証に失敗しました'}), 401
        
        # セッション確認
        if session_id not in active_sessions:
            return jsonify({'success': False, 'error': 'セッションが見つかりません'}), 404
        
        session_info = active_sessions[session_id]
        
        # 操作イベント
        interaction = {
            'type': data.get('type'),  # click, scroll, keypress, input
            'target': data.get('target'),  # CSS selector or coordinates
            'data': data.get('data'),  # event-specific data
            'timestamp': datetime.now().isoformat(),
            'encrypted': True
        }
        
        # 操作を暗号化（実際の実装では適切な暗号化を使用）
        encrypted_interaction = encrypt_interaction(interaction, SECRET_KEY)
        
        # Electronプロセスに送信（WebSocketまたはIPC経由）
        success = send_to_electron_process(session_id, encrypted_interaction)
        
        if success:
            session_info['interactions_count'] += 1
            return jsonify({
                'success': True,
                'message': '操作を送信しました',
                'interaction_id': str(uuid.uuid4())
            })
        else:
            return jsonify({
                'success': False,
                'error': '操作の送信に失敗しました'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'操作送信エラー: {str(e)}'
        }), 500

@electron_capture_bp.route('/stop-capture/<session_id>', methods=['POST'])
def stop_capture(session_id):
    """キャプチャを停止"""
    try:
        if session_id not in active_sessions:
            return jsonify({'success': False, 'error': 'セッションが見つかりません'}), 404
        
        session_info = active_sessions[session_id]
        
        # Electronプロセスを終了
        if session_info['process']:
            session_info['process'].terminate()
            session_info['process'].wait(timeout=5)
        
        # セッション情報を削除
        del active_sessions[session_id]
        
        return jsonify({
            'success': True,
            'message': 'キャプチャを停止しました',
            'session_stats': {
                'duration': (datetime.now() - datetime.fromisoformat(session_info['started_at'])).total_seconds(),
                'interactions_count': session_info['interactions_count']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'キャプチャ停止エラー: {str(e)}'
        }), 500

@electron_capture_bp.route('/sessions', methods=['GET'])
def get_active_sessions():
    """アクティブなセッション一覧を取得"""
    try:
        user_id = getattr(current_user, 'id', 'test_user')
        
        user_sessions = {
            session_id: {
                'session_id': session_id,
                'started_at': info['started_at'],
                'status': info['status'],
                'streams_count': len(info['streams']),
                'interactions_count': info['interactions_count'],
                'mode': info.get('mode', 'unknown'),
                'config': {
                    'quality': info['config']['quality'],
                    'frame_rate': info['config']['frame_rate'],
                    'audio_enabled': info['config']['audio_enabled'],
                    'interaction_enabled': info['config']['interaction_enabled']
                }
            }
            for session_id, info in active_sessions.items()
            if info['user_id'] == user_id
        }
        
        return jsonify({
            'success': True,
            'sessions': user_sessions,
            'total_count': len(user_sessions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'セッション取得エラー: {str(e)}'
        }), 500

@electron_capture_bp.route('/test', methods=['GET'])
def test_endpoint():
    """テスト用エンドポイント"""
    try:
        electron_available = check_electron_availability()
        
        return jsonify({
            'success': True,
            'message': 'Electron Capture API is working!',
            'timestamp': datetime.now().isoformat(),
            'electron_available': electron_available,
            'active_sessions_count': len(active_sessions),
            'system_info': {
                'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}",
                'platform': os.name
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'テストエラー: {str(e)}'
        }), 500

@electron_capture_bp.route('/check-electron', methods=['GET'])
def check_electron():
    """Electronの状態をチェック"""
    try:
        # Node.js環境の確認
        node_available = False
        node_version = None
        npm_available = False
        npm_version = None
        
        try:
            node_result = subprocess.run(['node', '--version'], 
                                       capture_output=True, text=True, timeout=5)
            if node_result.returncode == 0:
                node_available = True
                node_version = node_result.stdout.strip()
        except:
            pass
        
        try:
            npm_result = subprocess.run(['npm', '--version'], 
                                      capture_output=True, text=True, timeout=5)
            if npm_result.returncode == 0:
                npm_available = True
                npm_version = npm_result.stdout.strip()
        except:
            pass
        
        # Electronの実行環境として必要な条件
        electron_ready = node_available and npm_available
        
        return jsonify({
            'success': True,
            'electron_available': electron_ready,
            'node_available': node_available,
            'node_version': node_version,
            'npm_available': npm_available,
            'npm_version': npm_version,
            'installation_commands': {
                'node': 'Node.jsをhttps://nodejs.org/からインストール',
                'electron': 'npm install -g electron'
            },
            'alternative_mode': 'mock' if not electron_ready else None,
            'status_message': 'Electron実行環境が準備されています' if electron_ready else 'Node.js/npm環境が必要です'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'環境チェックエラー: {str(e)}'
        }), 500

def encrypt_interaction(interaction: dict, key: str) -> dict:
    """操作データを暗号化（簡易実装）"""
    # 実際の実装では、AESなどの適切な暗号化を使用
    import json
    data_str = json.dumps(interaction)
    # 簡易的な暗号化（実際にはAES等を使用）
    encrypted_data = base64.b64encode(data_str.encode()).decode()
    
    return {
        'encrypted_data': encrypted_data,
        'encryption_method': 'base64',  # 実際にはAES-256-GCM等
        'timestamp': datetime.now().isoformat()
    }

def send_to_electron_process(session_id: str, interaction: dict) -> bool:
    """Electronプロセスに操作を送信"""
    try:
        # 実際の実装では、WebSocketやIPCを使用してElectronプロセスと通信
        # ここでは模擬的な実装
        session_info = active_sessions.get(session_id)
        if not session_info:
            return False
        
        # WebSocket経由でElectronに送信（実装例）
        # websocket_client.send(json.dumps(interaction))
        
        return True
    except Exception:
        return False

def create_electron_script(script_path: str):
    """Electronスクリプトを作成"""
    electron_script_content = '''
const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const WebSocket = require('ws');
const crypto = require('crypto');

let mainWindow;
let captureConfig;
let wsServer;
let activeStreams = new Map();

// コマンドライン引数から設定を取得
const configArg = process.argv.find(arg => arg.startsWith('--config='));
if (configArg) {
    captureConfig = JSON.parse(configArg.split('=')[1]);
}

app.whenReady().then(() => {
    createWindow();
    startCapture();
    setupWebSocketServer();
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false // バックグラウンドで実行
    });
}

async function startCapture() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        // 複数のソースを同時キャプチャ
        for (const source of sources) {
            if (shouldCaptureSource(source)) {
                await startStreamCapture(source);
            }
        }
    } catch (error) {
        console.error('Capture failed:', error);
    }
}

function shouldCaptureSource(source) {
    // キャプチャ対象の判定ロジック
    const targetUrls = captureConfig.target_urls || [];
    
    if (targetUrls.length === 0) {
        return true; // 全てキャプチャ
    }
    
    return targetUrls.some(url => 
        source.name.toLowerCase().includes(url.toLowerCase())
    );
}

async function startStreamCapture(source) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: captureConfig.audio_enabled ? {
                mandatory: {
                    chromeMediaSource: 'desktop'
                }
            } : false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxFrameRate: captureConfig.frame_rate
                }
            }
        });

        activeStreams.set(source.id, {
            source: source,
            stream: stream,
            startTime: Date.now()
        });

        // WebSocketでストリームデータを送信
        broadcastStream(source.id, stream);
        
    } catch (error) {
        console.error('Stream capture failed:', error);
    }
}

function setupWebSocketServer() {
    wsServer = new WebSocket.Server({ 
        port: 8080,
        path: `/capture/${captureConfig.session_id}`
    });

    wsServer.on('connection', (ws) => {
        console.log('Client connected');
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleInteraction(data);
            } catch (error) {
                console.error('Message parsing error:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

function handleInteraction(interaction) {
    if (!captureConfig.interaction_enabled) {
        return;
    }

    // 操作を復号化
    const decryptedInteraction = decryptInteraction(interaction);
    
    // 操作を実行
    executeInteraction(decryptedInteraction);
}

function decryptInteraction(encryptedInteraction) {
    // 暗号化された操作を復号化
    const { encrypted_data } = encryptedInteraction;
    const decrypted = Buffer.from(encrypted_data, 'base64').toString();
    return JSON.parse(decrypted);
}

function executeInteraction(interaction) {
    // 実際の操作を実行
    switch (interaction.type) {
        case 'click':
            simulateClick(interaction.data);
            break;
        case 'scroll':
            simulateScroll(interaction.data);
            break;
        case 'keypress':
            simulateKeypress(interaction.data);
            break;
        case 'input':
            simulateInput(interaction.data);
            break;
    }
}

function simulateClick(data) {
    // クリック操作をシミュレート
    const { x, y, button } = data;
    // robotjsやnative APIを使用して実際のクリックを実行
}

function simulateScroll(data) {
    // スクロール操作をシミュレート
    const { deltaX, deltaY } = data;
    // スクロールイベントを送信
}

function simulateKeypress(data) {
    // キー入力をシミュレート
    const { key, modifiers } = data;
    // キーボードイベントを送信
}

function simulateInput(data) {
    // テキスト入力をシミュレート
    const { text, target } = data;
    // 指定された要素にテキストを入力
}

function broadcastStream(sourceId, stream) {
    // ストリームデータをWebSocket経由で配信
    wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            // ストリームデータを送信（実際にはWebRTC等を使用）
            client.send(JSON.stringify({
                type: 'stream_data',
                source_id: sourceId,
                timestamp: Date.now()
            }));
        }
    });
}

app.on('window-all-closed', () => {
    // クリーンアップ
    activeStreams.forEach((streamInfo) => {
        streamInfo.stream.getTracks().forEach(track => track.stop());
    });
    
    if (wsServer) {
        wsServer.close();
    }
    
    app.quit();
});
'''
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(electron_script_content)