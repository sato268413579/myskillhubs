import API_BASE_URL from "../config/api";
import {
  Project,
} from  "../services/ConstructionScheduleService";
import {
  Project as GanttChartProject,
} from  "../pages/GanttChart";

export interface LoadProjectAndMilestonesResponse {
  success: boolean;
  project: Project;
  milestones: Project;
  error: string;
}
export interface CallGeminiResponse {
  success: boolean;
  message: string;
}

export interface Milestone {
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

export const getProjectAndMilestones = async(projectId: string | undefined): Promise<LoadProjectAndMilestonesResponse> => {
  const res = await fetch(`${API_BASE_URL}/construction-schedule/projects/${projectId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("failed to fetch call gemini");

  const data = await res.json();  // 一度だけ呼ぶ
  return data;
}

export const callGemini = async (project: GanttChartProject, milestones: Milestone[]): Promise<CallGeminiResponse> => {
  const res = await fetch(`${API_BASE_URL}/construction-schedule/call_gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({project, milestones})
  });
  if (!res.ok) throw new Error("failed to fetch call gemini");

  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};