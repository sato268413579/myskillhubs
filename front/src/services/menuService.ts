import API_BASE_URL from "../config/api";

export interface MenuItem {
  name: string;
  x: number;
  y: number;
  z: number;
}

// Flask API からメニュー配置を取得
export async function getMenuLayout(intent: string): Promise<MenuItem[]> {
  const res = await fetch(`${API_BASE_URL}/3d`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent }),
  });
  const data = await res.json();
  return data.menus;
}
