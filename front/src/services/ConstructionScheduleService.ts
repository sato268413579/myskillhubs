import API_BASE_URL from "../config/api";

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string;
  client_name: string;
  site_location?: string | null;
  start_date: string;
  end_date: string;
  status: string;
  milestones_count: number;
}
export interface ProjectResponse {
  success: string;
  projects: Project[];
  error: string;
}
export interface ProjectCreateResponse {
  success: boolean;
  message: string;
  project: Project;
  error: string;
}
export interface ProjectDeleteResponse {
  success: boolean;
  message: string;
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
export type projectFormData = {
  name: string;
  description: string;
  client_name: string;
  site_location: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
}

export const getProjects = async (): Promise<ProjectResponse> => {
  const res = await fetch(`${API_BASE_URL}/construction-schedule/projects`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("failed to fetch projects");

  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};

export const createProjects = async (formData: projectFormData): Promise<ProjectCreateResponse> => {
  const res = await fetch(`${API_BASE_URL}/construction-schedule/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(formData)
  });
  if (!res.ok) throw new Error("failed to fetch create projects");

  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};

export const deleteProjects = async (id: number): Promise<ProjectDeleteResponse> => {
  const res = await fetch(`${API_BASE_URL}/construction-schedule/projects/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error("failed to fetch delete projects");

  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};