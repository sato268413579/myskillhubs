import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

interface Project {
  id: number;
  name: string;
  description: string;
  client_name: string;
  site_location: string;
  start_date: string;
  end_date: string;
  status: string;
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

const GanttChart: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [draggedMilestone, setDraggedMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    progress_percentage: number;
    assigned_to: string;
    color: string;
    notes: string;
  }>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'not_started',
    progress_percentage: 0,
    assigned_to: '',
    color: '#3B82F6',
    notes: ''
  });

  useEffect(() => {
    loadProjectAndMilestones();
  }, [projectId]);

  const loadProjectAndMilestones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/construction-schedule/projects/${projectId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
        setMilestones(data.milestones);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMilestone
        ? `${API_BASE_URL}/construction-schedule/milestones/${editingMilestone.id}`
        : `${API_BASE_URL}/construction-schedule/milestones`;
      
      const response = await fetch(url, {
        method: editingMilestone ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(editingMilestone ? '工程を更新しました' : '工程を作成しました');
        setShowMilestoneForm(false);
        setEditingMilestone(null);
        resetForm();
        loadProjectAndMilestones();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (error) {
      console.error('工程保存エラー:', error);
      alert('工程の保存に失敗しました');
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      name: milestone.name,
      description: milestone.description || '',
      start_date: milestone.start_date.split('T')[0],
      end_date: milestone.end_date.split('T')[0],
      status: milestone.status,
      progress_percentage: milestone.progress_percentage,
      assigned_to: milestone.assigned_to || '',
      color: milestone.color,
      notes: milestone.notes || ''
    });
    setShowMilestoneForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('この工程を削除しますか？')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/construction-schedule/milestones/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        alert('工程を削除しました');
        loadProjectAndMilestones();
      }
    } catch (error) {
      console.error('工程削除エラー:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'not_started',
      progress_percentage: 0,
      assigned_to: '',
      color: '#3B82F6',
      notes: ''
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      not_started: '未着手',
      in_progress: '進行中',
      completed: '完了',
      delayed: '遅延'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      not_started: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      delayed: 'bg-red-500'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-500';
  };

  // 簡易ガントチャート表示用の日付計算
  const getDateRange = () => {
    if (milestones.length === 0) return { start: new Date(), end: new Date(), days: 0 };
    
    const dates = milestones.flatMap(m => [new Date(m.start_date), new Date(m.end_date)]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return { start, end, days };
  };

  const getMilestonePosition = (milestone: Milestone, rangeStart: Date, totalDays: number) => {
    const start = new Date(milestone.start_date);
    const end = new Date(milestone.end_date);
    const startOffset = Math.ceil((start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
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

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">プロジェクトが見つかりません</p>
          <button
            onClick={() => navigate('/service/construction-schedule')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            プロジェクト一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const { start: rangeStart, end: rangeEnd, days: totalDays } = getDateRange();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/service/construction-schedule')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← プロジェクト一覧に戻る
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                {project.client_name && <span>顧客: {project.client_name}</span>}
                {project.start_date && project.end_date && (
                  <span>
                    期間: {new Date(project.start_date).toLocaleDateString('ja-JP')} 〜 
                    {new Date(project.end_date).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setEditingMilestone(null);
                resetForm();
                setShowMilestoneForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              工程追加
            </button>
          </div>
        </div>

        {/* 工程作成/編集フォーム */}
        {showMilestoneForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingMilestone ? '工程編集' : '工程追加'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工程名 *
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
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日 *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="not_started">未着手</option>
                      <option value="in_progress">進行中</option>
                      <option value="completed">完了</option>
                      <option value="delayed">遅延</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      進捗率 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress_percentage}
                      onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      表示色
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当者
                  </label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {editingMilestone ? '更新' : '作成'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMilestoneForm(false);
                      setEditingMilestone(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ガントチャート */}
        {milestones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">工程がありません</h3>
            <p className="text-gray-500 mb-4">工程を追加してガントチャートを作成しましょう</p>
            <button
              onClick={() => {
                resetForm();
                setShowMilestoneForm(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              最初の工程を追加
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">ガントチャート</h2>
              <p className="text-sm text-gray-600 mt-1">
                期間: {rangeStart.toLocaleDateString('ja-JP')} 〜 {rangeEnd.toLocaleDateString('ja-JP')} ({totalDays}日間)
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* ヘッダー */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-64 p-3 font-semibold border-r">工程名</div>
                  <div className="flex-1 p-3 font-semibold">タイムライン</div>
                  <div className="w-32 p-3 font-semibold border-l text-center">操作</div>
                </div>
                
                {/* 工程行 */}
                {milestones.map((milestone) => {
                  const position = getMilestonePosition(milestone, rangeStart, totalDays);
                  return (
                    <div key={milestone.id} className="flex border-b hover:bg-gray-50">
                      <div className="w-64 p-3 border-r">
                        <div className="font-medium">{milestone.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(milestone.start_date).toLocaleDateString('ja-JP')} 〜 
                          {new Date(milestone.end_date).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${getStatusColor(milestone.status)}`}>
                            {getStatusLabel(milestone.status)}
                          </span>
                          <span className="text-xs text-gray-600">{milestone.progress_percentage}%</span>
                        </div>
                      </div>
                      <div className="flex-1 p-3 relative">
                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 h-8 rounded flex items-center px-2 text-white text-xs font-medium shadow"
                          style={{
                            left: position.left,
                            width: position.width,
                            backgroundColor: milestone.color
                          }}
                        >
                          <div className="truncate">{milestone.name}</div>
                        </div>
                      </div>
                      <div className="w-32 p-3 border-l flex gap-1 justify-center">
                        <button
                          onClick={() => handleEdit(milestone)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(milestone.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
