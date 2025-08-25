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

  // サービス一覧データ
  const services: ServiceItem[] = [
    {
      id: "tasks",
      name: "タスク管理ツール",
      description: "シンプルで使いやすいタスク管理アプリです。",
      icon: "📝",
      path: "/service/tasks",
      tags: ["管理", "Todo", "効率化"],
      status: "active",
    },
    {
      id: "chat",
      name: "チャットサービス",
      description: "リアルタイムにメッセージをやり取りできます。",
      icon: "💬",
      path: "#", // 仮
      tags: ["コミュニケーション"],
      status: "beta",
    },
    {
      id: "analytics",
      name: "アクセス解析",
      description: "サービス利用状況を可視化します。",
      icon: "📊",
      path: "#", // 仮
      tags: ["データ", "分析"],
      status: "down",
    },
    {
      id: "crm",
      name: "CRM（顧客管理）",
      description: "顧客情報を一元管理し、営業活動を効率化します。",
      icon: "👥",
      path: "/service/crm",
      tags: ["顧客", "営業支援", "管理"],
      status: "active",
    },
  ];

  return (
    <main className="service-page">
      <h1 className="service-title">サービス一覧</h1>
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
    </main>
  );
};

export default Service;
