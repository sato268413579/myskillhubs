import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Service.css";

// サービス型定義
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  tags: string[];
  status: "active" | "beta" | "down";
}

const Service: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ユーザーが利用可能なサービスを取得
  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-services/my-services', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setServices(data.services);
        } else {
          console.error('サービス取得エラー:', data.error);
          // エラー時はデフォルトサービスを表示
          setServices([]);
        }
      } catch (error) {
        console.error('サービス取得エラー:', error);
        // エラー時はデフォルトサービスを表示
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <main className="service-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p style={{ marginTop: '20px', color: '#666' }}>サービスを読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="service-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="service-title" style={{ margin: 0 }}>サービス一覧</h1>
        <button
          onClick={() => navigate('/service/settings')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⚙️ サービス設定
        </button>
      </div>
      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <h2 style={{ color: '#666', marginBottom: '10px' }}>利用可能なサービスがありません</h2>
          <p style={{ color: '#999' }}>管理者にサービスの有効化を依頼してください</p>
        </div>
      ) : (
        <div className="service-grid">
          {services.map((svc) => (
          <div
            key={svc.id}
            className={`service-card ${svc.status}`}
            onClick={() => svc.path !== "#" && navigate(svc.path)}
          >
            <div className="card-header">
              <div className="card-icon">{svc.icon}</div>
              <span className={`badge ${svc.status}`}>
                {svc.status === "active"
                  ? "稼働中"
                  : svc.status === "beta"
                    ? "β版"
                    : "停止中"}
              </span>
            </div>
            <h2 className="card-title">{svc.name}</h2>
            <p className="card-desc">{svc.description}</p>
            <ul className="card-tags">
              {svc.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      )}
    </main>
  );
};

export default Service;
