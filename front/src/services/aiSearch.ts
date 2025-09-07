import API_BASE_URL from "../config/api";

export interface TrendSearchLog {

}

export const getTrendSearchLog = async (): Promise<TrendSearchLog[]> => {
  const res = await fetch(`${API_BASE_URL}/trendSearch`);
  if (!res.ok) throw new Error("failed to fetch trendSearch");
  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};

export const search = async (trend: string) => {
  const res = await fetch(`${API_BASE_URL}/trendSearch/search?trend=${trend}`);
  if (!res.ok) throw new Error("failed to fetch search");
  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};