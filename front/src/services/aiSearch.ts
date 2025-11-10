import API_BASE_URL from "../config/api";

export interface TrendSearchLog {

}

export const getTrendSearchLog = async (): Promise<TrendSearchLog[]> => {
  const res = await fetch(`${API_BASE_URL}/trendSearch`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("failed to fetch trendSearch");
  const data = await res.json();  // 一度だけ呼ぶ
  return data;
};

export const search = async (trend: string) => {
  // AbortControllerでタイムアウト制御
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分

  try {
    const res = await fetch(`${API_BASE_URL}/trendSearch/search?trend=${encodeURIComponent(trend)}`, {
      credentials: 'include',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("failed to fetch search");
    const data = await res.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - 分析に時間がかかっています。しばらくお待ちください。');
    }
    throw error;
  }
};

export const searchSimple = async (trend: string) => {
  const res = await fetch(`${API_BASE_URL}/trendSearch/search/simple?trend=${encodeURIComponent(trend)}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("failed to fetch simple search");
  const data = await res.json();
  return data;
};