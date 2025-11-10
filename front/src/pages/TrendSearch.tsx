import React, { useState } from "react";
import Button from "../components/Button";
import { Card, CardContent } from "../components/Card";
import TrendSearchDemo from "../components/TrendSearchDemo";
import API_BASE_URL from "../config/api";

// Markdown表示用のコンポーネント（react-markdownが利用できない場合の代替）
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // 簡易的なMarkdown解析（基本的な要素のみ対応）
  const parseMarkdown = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-gray-800 mt-4 mb-2">$1</h2>')
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-gray-700 mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/- (.*)/g, '<li class="ml-4 text-gray-700">• $1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

interface TrendResult {
  detailed_summary: string;
}

const TrendSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // サンプルとして用意するトレンド候補
  const trends = ["AI技術", "リモートワーク", "サステナビリティ", "NFT", "メタバース", "Web3", "DX", "フィンテック"];

  const handleSearch = async (trend: string) => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      // AbortControllerでタイムアウト制御
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分

      const res = await fetch(`${API_BASE_URL}/trendSearch/search?trend=${encodeURIComponent(trend)}`, {
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`検索に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError("分析がタイムアウトしました。2段階分析のため時間がかかる場合があります。");
      } else if (err instanceof Error) {
        setError(err.message || "検索に失敗しました");
      } else {
        setError("検索に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">トレンド検索</h1>

        {/* カテゴリ別トレンド選択 */}
        {!result && !loading && (
          <TrendSearchDemo onTrendSelect={handleSearch} loading={loading} />
        )}

        {/* クイックアクセストレンド */}
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
          <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <div className="text-center">
              <p className="font-medium">2段階AI分析を実行中...</p>
              <p className="text-sm text-gray-400 mt-1">
                Phase 1: 基本分析とキーワード抽出<br/>
                Phase 2: 詳細分析と市場調査<br/>
                <span className="text-yellow-600">※ 通常2-5分程度かかります</span>
              </p>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}

        {/* 結果表示 */}
        {result && (
          <div className="space-y-4">
            {/* 新しい検索ボタン */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
              >
                🔍 新しい検索
              </Button>
            </div>

            {/* 詳細分析レポート */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  📝 詳細分析レポート
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <MarkdownRenderer content={result.detailed_summary} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendSearch;
