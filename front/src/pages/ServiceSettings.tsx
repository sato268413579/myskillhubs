import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getUserServices, enableUserService, disableUserService, User, ServiceItemWithStatus } from '../services/userService';
import { currentUser } from '../services/login';

const ServiceSettings: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [services, setServices] = useState<ServiceItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      // 管理者チェック
      const user = await currentUser();
      if (user.id !== 1) {
        alert('管理者権限が必要です');
        navigate('/service');
        return;
      }
      
      // ユーザー一覧を取得
      const userList = await getAllUsers();
      setUsers(userList);
      
      // 最初のユーザーを選択
      if (userList.length > 0) {
        await loadUserServices(userList[0]);
      }
    } catch (error) {
      console.error('エラー:', error);
      navigate('/service');
    } finally {
      setLoading(false);
    }
  };

  const loadUserServices = async (user: User) => {
    try {
      setSelectedUser(user);
      const data = await getUserServices(user.id);
      setServices(data.services);
    } catch (error) {
      console.error('サービス取得エラー:', error);
      alert('サービスの取得に失敗しました');
    }
  };

  const toggleService = async (serviceId: string, currentStatus: boolean) => {
    if (!selectedUser) return;
    
    setUpdating(serviceId);
    try {
      const result = currentStatus 
        ? await disableUserService(selectedUser.id, serviceId)
        : await enableUserService(selectedUser.id, serviceId);
      
      await loadUserServices(selectedUser);
      alert(result.message);
    } catch (error) {
      console.error('サービス更新エラー:', error);
      alert(error instanceof Error ? error.message : 'サービスの更新に失敗しました');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/service')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← サービス一覧に戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">サービス管理（管理者用）</h1>
          <p className="text-gray-600 mt-1">ユーザーごとにサービスの利用権限を設定できます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ユーザー一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ユーザー一覧</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => loadUserServices(user)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedUser?.id === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{user.username}</div>
                    <div className={`text-sm ${selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      ID: {user.id}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* サービス一覧 */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedUser.username} のサービス設定
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    このユーザーが利用できるサービスを選択してください
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 ${
                        !service.is_enabled ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-4xl">{service.icon}</div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.is_enabled}
                            onChange={() => toggleService(service.id, service.is_enabled)}
                            disabled={updating === service.id}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded ${
                            service.is_enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {service.is_enabled ? '有効' : '無効'}
                        </span>
                      </div>

                      {updating === service.id && (
                        <div className="mt-3 text-center">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-sm text-gray-600">更新中...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-gray-600">左側からユーザーを選択してください</p>
              </div>
            )}
          </div>
        </div>

        {/* 説明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 ヒント</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 左側のユーザー一覧から管理したいユーザーを選択します</li>
            <li>• トグルスイッチでサービスの有効/無効を切り替えられます</li>
            <li>• 無効にしたサービスは、そのユーザーのサービス一覧に表示されなくなります</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceSettings;
