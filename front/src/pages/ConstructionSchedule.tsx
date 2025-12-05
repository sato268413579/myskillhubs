import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

interface Project {
  id: number;
  name: string;
  description: string;
  client_name: string;
  site_location: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  milestones_count: number;
}

interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  display_order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress_percentage: number;
  assigned_to: string;
  color: string;
  notes: string;
}

const ConstructionSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    client_name: string;
    site_location: string;
    start_date: string;
    end_date: string;
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  }>({
    name: '',
    description: '',
    client_name: '',
    site_location: '',
    start_date: '',
    end_date: '',
    status: 'planning'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/construction-schedule/projects`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/construction-schedule/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert('プロジェクトを作成しました');
        setShowProjectForm(false);
        setFormData({
          name: '',
          description: '',
          client_name: '',
          site_location: '',
          start_date: '',
          end_date: '',
          status: 'planning'
        });
        loadProjects();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      alert('プロジェクトの作成に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('このプロジェクトを削除しますか？関連する工程も削除されます。')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/construction-schedule/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        alert('プロジェクトを削除しました');
        loadProjects();
      }
    } catch (error) {
      console.error('プロジェクト削除エラー:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      planning: { label: '計画中', color: 'bg-gray-500' },
      in_progress: { label: '進行中', color: 'bg-blue-500' },
      completed: { label: '完了', color: 'bg-green-500' },
      on_hold: { label: '保留', color: 'bg-yellow-500' }
    };
    const s = statusMap[status as keyof typeof statusMap] || statusMap.planning;
    return (
      <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${s.color}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">工事工程管理</h1>
            <p className="text-gray-600 mt-1">プロジェクトと工程をガントチャートで管理</p>
          </div>
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            新規プロジェクト
          </button>
        </div>

        {/* プロジェクト作成フォーム */}
        {showProjectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">新規プロジェクト作成</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    プロジェクト名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      顧客名
                    </label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planning">計画中</option>
                      <option value="in_progress">進行中</option>
                      <option value="completed">完了</option>
                      <option value="on_hold">保留</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工事現場住所
                  </label>
                  <input
                    type="text"
                    value={formData.site_location}
                    onChange={(e) => setFormData({ ...formData, site_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始予定日
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了予定日
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    作成
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* プロジェクト一覧 */}
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">プロジェクトがありません</h3>
            <p className="text-gray-500 mb-4">新規プロジェクトを作成して工程管理を始めましょう</p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              最初のプロジェクトを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  {getStatusBadge(project.status)}
                </div>
                
                {project.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {project.client_name && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">顧客:</span>
                      <span>{project.client_name}</span>
                    </div>
                  )}
                  {project.site_location && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">現場:</span>
                      <span className="truncate">{project.site_location}</span>
                    </div>
                  )}
                  {project.start_date && project.end_date && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">期間:</span>
                      <span>
                        {new Date(project.start_date).toLocaleDateString('ja-JP')} 〜 
                        {new Date(project.end_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">工程数:</span>
                    <span>{project.milestones_count}件</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/service/construction-schedule/${project.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                  >
                    ガントチャート
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionSchedule;
