import API_BASE_URL from "../config/api";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  tags: string[];
  status: "active" | "beta" | "down" | "disabled";
  is_enabled?: boolean;
}

export interface ServiceItemWithStatus extends ServiceItem {
  is_enabled: boolean;
}

export interface User {
  id: number;
  username: string;
}

interface ServiceResponse {
  success: boolean;
  services?: ServiceItem[];
  error?: string;
  message?: string;
}

interface UsersResponse {
  success: boolean;
  users?: User[];
  error?: string;
}

interface UserServicesResponse {
  success: boolean;
  user?: User;
  services?: ServiceItemWithStatus[];
  error?: string;
}

// ユーザーが利用可能なサービスを取得
export const getMyServices = async (): Promise<ServiceItem[]> => {
  const res = await fetch(`${API_BASE_URL}/user-services/my-services`, {
    credentials: 'include'
  });
  const data: ServiceResponse = await res.json();
  
  if (data.success && data.services) {
    return data.services;
  }
  throw new Error(data.error || 'サービスの取得に失敗しました');
};

// 全ユーザー一覧を取得（管理者専用）
export const getAllUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE_URL}/user-services/all-users`, {
    credentials: 'include'
  });
  const data: UsersResponse = await res.json();
  
  if (data.success && data.users) {
    return data.users;
  }
  throw new Error(data.error || 'ユーザーの取得に失敗しました');
};

// 特定ユーザーのサービス一覧を取得（管理者専用）
export const getUserServices = async (userId: number): Promise<{ user: User; services: ServiceItemWithStatus[] }> => {
  const res = await fetch(`${API_BASE_URL}/user-services/user/${userId}/services`, {
    credentials: 'include'
  });
  const data: UserServicesResponse = await res.json();
  
  if (data.success && data.user && data.services) {
    return { user: data.user, services: data.services };
  }
  throw new Error(data.error || 'サービスの取得に失敗しました');
};

// 特定ユーザーのサービスを有効化（管理者専用）
export const enableUserService = async (userId: number, serviceId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/user-services/user/${userId}/enable/${serviceId}`, {
    method: 'POST',
    credentials: 'include'
  });
  const data: ServiceResponse = await res.json();
  
  if (data.success) {
    return { message: data.message || 'サービスを有効化しました' };
  }
  throw new Error(data.error || 'サービスの有効化に失敗しました');
};

// 特定ユーザーのサービスを無効化（管理者専用）
export const disableUserService = async (userId: number, serviceId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/user-services/user/${userId}/disable/${serviceId}`, {
    method: 'POST',
    credentials: 'include'
  });
  const data: ServiceResponse = await res.json();
  
  if (data.success) {
    return { message: data.message || 'サービスを無効化しました' };
  }
  throw new Error(data.error || 'サービスの無効化に失敗しました');
};
