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
  popularity_score?: number;
  trend_direction?: string;
  related_topics?: string[];
  search_timestamp?: string;
  data_sources?: number;
  key_findings?: string[];
  market_data?: string;
  recent_developments?: string;
  key_points?: string[];
  current_status?: string;
  raw_response?: string; // エラー時用
}

const TrendSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'full' | 'simple'>('simple');

  // サンプルとして用意するトレンド候補
  const trends = ["AI技術", "リモートワーク", "サステナビリティ", "NFT", "メタバース", "Web3", "DX", "フィンテック"];

  const handleSearch = async (trend: string) => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const endpoint = searchMode === 'full' ? 'search' : 'search/simple';
      const res = await fetch(`${API_BASE_URL}/trendSearch/${endpoint}?trend=${encodeURIComponent(trend)}`);
      
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

        {/* 検索モード選択 */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setSearchMode('simple')}
              className={`px-4 py-2 rounded-md transition ${
                searchMode === 'simple'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              クイック検索 (3-10秒)
            </button>
            <button
              onClick={() => setSearchMode('full')}
              className={`px-4 py-2 rounded-md transition ${
                searchMode === 'full'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              詳細検索 (10-30秒)
            </button>
          </div>
        </div>

        {/* 検索モード説明 */}
        <div className="text-center text-sm text-gray-600">
          {searchMode === 'simple' 
            ? '🚀 検索結果のみを使用した高速分析' 
            : '🔍 ウェブスクレイピングを含む詳細分析'
          }
        </div>

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
                    {result.trend_direction && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTrendDirectionColor(result.trend_direction)}`}>
                        📈 {result.trend_direction}
                      </span>
                    )}
                  </div>
                  
                  {/* 人気度スコア */}
                  {result.popularity_score !== undefined && (
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-gray-600 mb-1">人気度</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${getPopularityColor(result.popularity_score)}`}
                            style={{ width: `${result.popularity_score}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-700">
                          {result.popularity_score}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* メタデータ */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  {result.search_timestamp && (
                    <span>🕒 {new Date(result.search_timestamp).toLocaleString('ja-JP')}</span>
                  )}
                  {result.data_sources && (
                    <span>📊 データソース: {result.data_sources}件</span>
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

            {/* キーワードと関連トピック */}
            <div className="grid md:grid-cols-2 gap-4">
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

              {/* 関連トピック */}
              {result.related_topics && result.related_topics.length > 0 && (
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      🔗 関連トピック
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.related_topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 重要な発見・ポイント */}
            {((result.key_findings && result.key_findings.length > 0) || (result.key_points && result.key_points.length > 0)) && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    🔍 重要な発見
                  </h3>
                  <div className="space-y-3">
                    {(result.key_findings || result.key_points || []).map((finding, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          !
                        </span>
                        <p className="text-gray-700 leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 市場データと現在の状況 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 市場データ */}
              {result.market_data && (
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      📊 市場データ
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {result.market_data}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 現在の状況 */}
              {result.current_status && (
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      📈 現在の状況
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {result.current_status}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 最近の動向 */}
            {result.recent_developments && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    🆕 最近の動向
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    {result.recent_developments}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 洞察 */}
            {result.insights?.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    💡 専門家の洞察
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
