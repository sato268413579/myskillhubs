import API_BASE_URL from "../config/api";
import { Service } from "../types";

export const login = async (username: string, password: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

export const getServices = async (): Promise<Service[]> => {
  const res = await fetch(`${API_BASE_URL}/services`, { credentials: "include" });
  if (!res.ok) throw new Error("認証が必要です");
  return res.json();
};
