import React from 'react';
import { Card, CardContent } from './Card';

interface TrendSearchDemoProps {
  onTrendSelect: (trend: string) => void;
  loading: boolean;
}

const TrendSearchDemo: React.FC<TrendSearchDemoProps> = ({ onTrendSelect, loading }) => {
  const demoTrends = [
    {
      category: "テクノロジー",
      trends: ["AI技術", "Web3", "メタバース", "量子コンピューティング"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      category: "ビジネス",
      trends: ["リモートワーク", "DX", "フィンテック", "サブスクリプション"],
      color: "from-green-500 to-emerald-600"
    },
    {
      category: "社会・環境",
      trends: ["サステナビリティ", "SDGs", "カーボンニュートラル", "循環経済"],
      color: "from-emerald-500 to-teal-600"
    },
    {
      category: "ライフスタイル",
      trends: ["ウェルビーイング", "ミニマリズム", "デジタルデトックス", "ワークライフバランス"],
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          カテゴリ別トレンド検索
        </h2>
        <p className="text-gray-600 text-sm">
          気になるカテゴリからトレンドを選んで検索してみましょう
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {demoTrends.map((category) => (
          <Card key={category.category} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color} mr-2`}></span>
                {category.category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.trends.map((trend) => (
                  <button
                    key={trend}
                    onClick={() => onTrendSelect(trend)}
                    disabled={loading}
                    className={`p-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-left`}
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
          <span>💡</span>
          <span>カスタムトレンドを検索したい場合は、上部の検索モードを選択してください</span>
        </div>
      </div>
    </div>
  );
};

export default TrendSearchDemo;