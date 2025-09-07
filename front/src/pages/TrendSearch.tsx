import React, { useState } from "react";
import { search } from "../services/aiSearch";
import Button from "../components/Button";
import { Card, CardContent } from "../components/Card";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">トレンド検索</h1>

        {/* トレンド選択ボタン群 */}
        <div className="flex flex-wrap justify-center gap-3">
          {trends.map((t) => (
            <Button
              key={t}
              onClick={() => handleSearch(t)}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow hover:scale-105 transition disabled:opacity-50"
            >
              {t}
            </Button>
          ))}
        </div>

        {/* ローディング表示 */}
        {loading && (
          <div className="flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            検索中...
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-4">
            {/* トレンドタイトル */}
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold text-indigo-700">
                  トレンド: {result.trend}
                </h2>
              </CardContent>
            </Card>

            {/* 要約 */}
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">要約</h3>
                <p className="text-gray-700">{result.summary}</p>
              </CardContent>
            </Card>

            {/* キーワード */}
            {result.keywords?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">キーワード</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 洞察 */}
            {result.insights?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">洞察</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {result.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 生レスポンス */}
            {result.raw_response && (
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">生レスポンス</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
                    {result.raw_response}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendSearch;
