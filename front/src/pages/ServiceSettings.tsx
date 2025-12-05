import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  tags: string[];
  is_enabled: boolean;
  status: string;
}

const ServiceSettings: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user-services/all-services', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('サービス取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (serviceId: string, currentStatus: boolean) => {
    setUpdating(serviceId);
    try {
      const endpoint = currentStatus ? 'disable' : 'enable';
      const response = await fetch(`http://localhost:5000/api/user-services/${endpoint}/${serviceId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        // サービス一覧を再読み込み
        await loadServices();
        alert(data.message);
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('サービス更新エラー:', error);
      alert('サービスの更新に失敗しました');
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
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/service')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← サービス一覧に戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">サービス設定</h1>
          <p className="text-gray-600 mt-1">利用するサービスを選択してください</p>
        </div>

        {/* サービス一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
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
                {service.is_enabled && (
                  <button
                    onClick={() => navigate(service.path)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    開く →
                  </button>
                )}
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

        {/* 説明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 ヒント</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• トグルスイッチでサービスの有効/無効を切り替えられます</li>
            <li>• 無効にしたサービスはサービス一覧に表示されなくなります</li>
            <li>• いつでも再度有効化できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceSettings;
