import React, { useState } from "react";
import { search } from "../services/aiSearch.ts";

interface TrendResult {
  trend: string;
  summary: string;
  keywords: string[];
  insights: string[];
  raw_response?: string; // GeminiがJSON返さなかったとき用
}

const TrendSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // サンプルとして用意するトレンド候補
  const trends = ["AI", "美容", "フリーランス", "飲食", "スタートアップ"];

  const handleSearch = async (trend: string) => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await search(trend);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">トレンド検索</h1>

      {/* トレンド選択ボタン群 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {trends.map((t) => (
          <button
            key={t}
            onClick={() => handleSearch(t)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 mb-4">検索中...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {result && (
        <div className="bg-white shadow-md rounded-lg p-4 space-y-3">
          <h2 className="text-xl font-semibold">トレンド: {result.trend}</h2>
          <p className="text-gray-700">{result.summary}</p>

          {result.keywords?.length > 0 && (
            <div>
              <h3 className="font-semibold">キーワード</h3>
              <ul className="list-disc list-inside">
                {result.keywords.map((kw, i) => (
                  <li key={i}>{kw}</li>
                ))}
              </ul>
            </div>
          )}

          {result.insights?.length > 0 && (
            <div>
              <h3 className="font-semibold">洞察</h3>
              <ul className="list-disc list-inside">
                {result.insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {result.raw_response && (
            <div>
              <h3 className="font-semibold">生レスポンス</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
                {result.raw_response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendSearch;
