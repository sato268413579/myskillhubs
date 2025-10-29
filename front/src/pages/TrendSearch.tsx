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
  trend: string;
  summary: string;
  keywords: string[];
  insights: string[];
  latest_developments: string[];
  market_analysis: {
    current_status: string;
    growth_trend: string;
    key_players: string[];
  };
  future_outlook: string[];
  reliability_note: string;
  research_timestamp?: string;
  research_type?: string;
  analysis_method?: string;
  raw_response?: string; // エラー時用
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
      const res = await fetch(`${API_BASE_URL}/trendSearch/search?trend=${encodeURIComponent(trend)}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`検索に失敗しました (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getTrendDirectionColor = (direction?: string) => {
    switch (direction) {
      case '上昇中': return 'text-green-600 bg-green-100';
      case '下降中': return 'text-red-600 bg-red-100';
      case '安定': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPopularityColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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
            {/* トレンドタイトルと基本情報 */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">
                      {result.trend}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        🤖 Gemini AI分析
                      </span>
                      {result.research_type && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          {result.research_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* メタデータ */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  {result.research_timestamp && (
                    <span>🕒 {new Date(result.research_timestamp).toLocaleString('ja-JP')}</span>
                  )}
                  {result.analysis_method && (
                    <span>🔧 {result.analysis_method}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 要約（Markdown形式対応） */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  📝 詳細分析レポート
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <MarkdownRenderer content={result.summary} />
                </div>
              </CardContent>
            </Card>

            {/* キーワード */}
            {result.keywords?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    🏷️ キーワード
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 最新動向 */}
            {result.latest_developments?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    🆕 最新動向
                  </h3>
                  <div className="space-y-3">
                    {result.latest_developments.map((development, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{development}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 市場分析 */}
            {result.market_analysis && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    📊 市場分析
                  </h3>
                  <div className="space-y-4">
                    {/* 現在の状況 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📈 現在の状況</h4>
                      <p className="text-gray-700">{result.market_analysis.current_status}</p>
                    </div>
                    
                    {/* 成長トレンド */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">📈 成長トレンド</h4>
                      <p className="text-gray-700">{result.market_analysis.growth_trend}</p>
                    </div>
                    
                    {/* 主要プレイヤー */}
                    {result.market_analysis.key_players?.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">🏢 主要プレイヤー</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.market_analysis.key_players.map((player, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {player}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 将来展望 */}
            {result.future_outlook?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    🔮 将来展望
                  </h3>
                  <div className="space-y-3">
                    {result.future_outlook.map((outlook, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{outlook}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 洞察 */}
            {result.insights?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    💡 Gemini AIの洞察
                  </h3>
                  <div className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 信頼性に関する注記 */}
            {result.reliability_note && (
              <Card className="shadow-lg border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-yellow-700">
                    ⚠️ 信頼性に関する注記
                  </h3>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {result.reliability_note}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* エラー時の生レスポンス */}
            {result.raw_response && (
              <Card className="shadow-lg border-yellow-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-yellow-700">
                    ⚠️ 解析エラー - 生レスポンス
                  </h3>
                  <pre className="bg-yellow-50 p-4 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto border border-yellow-200">
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
