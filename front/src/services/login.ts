import API_BASE_URL from "../config/api";
import { Service } from "../types";

export const login = async (username: string, password: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

export const currentUser = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};
