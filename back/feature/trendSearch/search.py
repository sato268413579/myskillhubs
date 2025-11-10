"""
LangChain + LangGraph を使用したGemini APIベースのトレンド調査システム
"""

import json
import os
import requests
from typing import Dict, List, Any
from datetime import datetime, date

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

# LangGraph imports
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

# Initialize Gemini AI（詳細分析設定）
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0,
    convert_system_message_to_human=True,
    max_output_tokens=8192  # 詳細な分析のため出力トークン数を増加
)

# LangGraph State Definition
class TrendResearchState(TypedDict):
    trend: str
    web_search_results: List[Dict[str, Any]]
    final_result: Dict[str, Any]
    error_message: str

print("✅ Gemini-based Trend Research Assistant with LangGraph initialized")

# Web Search Functions
def perform_web_search(query: str, num_results: int = 10) -> List[Dict[str, Any]]:
    """
    Web検索を実行する関数（Google Custom Search API使用）
    """
    try:
        # Google Custom Search API設定
        api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
        
        if not api_key or not search_engine_id:
            print("⚠️ Google Search API認証情報が見つかりません。フォールバック検索を使用します")
            return perform_fallback_search(query, num_results)
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': api_key,
            'cx': search_engine_id,
            'q': query,
            'num': min(num_results, 10),  # Google API limit
            'dateRestrict': 'm6'  # 過去6ヶ月以内の結果（高速化）
        }
        
        response = requests.get(url, params=params, timeout=5)  # タイムアウトを5秒に短縮
        response.raise_for_status()
        
        data = response.json()
        results = []
        
        for item in data.get('items', []):
            results.append({
                'title': item.get('title', ''),
                'link': item.get('link', ''),
                'snippet': item.get('snippet', ''),
                'displayLink': item.get('displayLink', ''),
                'formattedUrl': item.get('formattedUrl', '')
            })
        
        print(f"✅ Web検索完了: {len(results)}件の結果を取得")
        return results
        
    except Exception as e:
        print(f"❌ Web検索エラー: {e}")
        return perform_fallback_search(query, num_results)

def perform_fallback_search(query: str, num_results: int = 10) -> List[Dict[str, Any]]:
    """
    Web検索APIが利用できない場合のフォールバック
    """
    print(f"🔄 フォールバック検索を使用: {query}")
    
    # 基本的な検索結果のモック（実際の実装では他の検索APIやスクレイピングを使用）
    fallback_results = [
        {
            'title': f'{query}に関する最新情報',
            'link': 'https://example.com/search-unavailable',
            'snippet': f'{query}の詳細な情報を取得するため、直接的な情報源の確認をお勧めします。',
            'displayLink': 'example.com',
            'formattedUrl': 'https://example.com/search-unavailable'
        }
    ]
    
    return fallback_results

# LangGraph Node Functions
def web_search_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: Web検索を実行
    """
    trend = state["trend"]
    print(f"🌐 [LangGraph Phase 0] Web検索を開始: {trend}")
    
    try:
        # 1回の検索クエリのみ実行（高速化）
        search_query = f"{trend} 最新動向 2025"
        
        print(f"🔍 検索中: {search_query}")
        results = perform_web_search(search_query, 8)  # 8件に制限
        
        state["web_search_results"] = results[:8]  # 最大8件に制限
        print(f"✅ [LangGraph Phase 0] Web検索完了: {len(state['web_search_results'])}件の結果")
        return state
        
    except Exception as e:
        print(f"❌ [LangGraph Phase 0] Web検索エラー: {e}")
        state["error_message"] = f"Web検索エラー: {str(e)}"
        state["web_search_results"] = perform_fallback_search(trend, 5)
        return state
def analysis_and_finalize_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: Web検索結果を活用した包括的分析と最終レポート生成
    """
    trend = state["trend"]
    web_results = state["web_search_results"]
    print(f"🤖 [LangGraph Phase 1] 包括的トレンド分析を開始: {trend}")
    
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.strftime("%Y年%m月")
    
    # Web検索結果を簡潔に文字列に変換（高速化）
    web_context = ""
    if web_results:
        web_context = "\n【Web検索結果（最新ニュース）】\n"
        for i, result in enumerate(web_results[:6], 1):  # 最大6件のみ使用
            web_context += f"{i}. {result['title']}\n"
            web_context += f"   {result['snippet']}\n\n"
    
    # 詳細な分析プロンプト
    analysis_prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=f"""あなたは{current_month}時点での{trend}に関する調査の専門家です。
以下のWeb検索結果を参考にして、詳細で具体的な分析レポートを作成してください。

{web_context}

出力形式: 以下のJSON形式で回答してください
{{
  "detailed_summary": "Markdown形式の詳細調査レポート"
}}

detailed_summaryには以下の内容を含めてください：

# 📊 {trend}の詳細分析レポート

## 📋 概要
- {trend}の定義と背景を3-4文で説明
- なぜ今注目されているのか具体的に記述

## 🔍 現在の状況（{current_year}年）
- 市場規模や普及状況を具体的な数値やデータで説明
- 主要なプレイヤー（企業、組織、人物）を3-5個挙げて、それぞれの役割を説明
- 現在の技術レベルや実用化の段階を詳しく記述

## 📈 最新動向とトレンド
- {current_year}年の重要な出来事やニュースを5-7個、時系列で具体的に列挙
- 各動向について、なぜ重要なのか、どんな影響があるのかを説明
- Web検索結果から得られた最新情報を引用

## 💡 技術的・ビジネス的な特徴
- 技術的な仕組みや特徴を分かりやすく説明
- ビジネスモデルや収益構造について具体例を挙げて説明
- 他の類似技術やトレンドとの違いを明確に

## 🌍 市場分析
- 市場規模の推移（過去・現在・予測）を具体的な数値で
- 成長率や市場シェアのデータ
- 地域別の普及状況や特徴
- 競合状況と市場の構造

## 🎯 主要プレイヤーの戦略
- 主要企業・組織の具体的な取り組みを3-5個詳しく説明
- 各プレイヤーの強みと戦略の違い
- 最近の提携や買収などの動き

## 🔮 将来展望（今後3-5年）
- 短期的な展望（1-2年）を3-4個具体的に
- 中長期的な展望（3-5年）を3-4個具体的に
- 予想される市場規模や普及率
- 技術的なブレークスルーの可能性

## ⚠️ リスクと課題
- 技術的な課題を3-4個具体的に
- ビジネス上の課題を3-4個具体的に
- 規制や法律面での懸念
- 社会的・倫理的な問題

## 💰 ビジネスチャンス
- 新規参入の機会を3-4個具体的に
- 既存企業の活用方法を3-4個具体的に
- 投資や協業の可能性
- 注目すべき周辺ビジネス

## 📚 参考情報
- Web検索で見つかった重要な情報源
- 関連する統計データや調査レポート

各セクションで具体的な数値、企業名、製品名、事例を可能な限り含めてください。
抽象的な表現は避け、具体的で実用的な情報を提供してください。

必ずJSONフォーマットで回答してください。"""),
        
        HumanMessage(content=f"""
調査対象: {trend}
上記のWeb検索結果を参考にして、詳細で具体的な分析レポートを作成してください。
各セクションで具体例、数値、企業名などを含めて詳しく記述してください。
        """)
    ])
    
    try:
        response = llm.invoke(analysis_prompt.format_messages())
        analysis_text = response.content.strip()
        
        # JSONの抽出とクリーンアップ
        if analysis_text.startswith("```"):
            analysis_text = analysis_text.strip("`")
            if analysis_text.startswith("json"):
                analysis_text = analysis_text[4:].strip()
        
        analysis_result = json.loads(analysis_text)
        
        # 最終結果を作成（詳細分析のみ）
        final_result = {
            "detailed_summary": analysis_result.get("detailed_summary", "")
        }
        
        state["final_result"] = final_result
        print("✅ [LangGraph Phase 1] 包括的分析が正常に完了")
        return state
        
    except json.JSONDecodeError as e:
        print(f"❌ [LangGraph Phase 1] JSON解析エラー: {e}")
        state["error_message"] = f"分析のJSON解析エラー: {str(e)}"
        state["final_result"] = create_fallback_analysis_dict(trend, state["error_message"])
        return state
    except Exception as e:
        print(f"❌ [LangGraph Phase 1] 分析エラー: {e}")
        state["error_message"] = f"分析エラー: {str(e)}"
        state["final_result"] = create_fallback_analysis_dict(trend, state["error_message"])
        return state



def create_fallback_analysis_dict(trend: str, error_message: str) -> Dict[str, Any]:
    """
    分析が失敗した場合のフォールバック分析
    """
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.strftime("%Y年%m月")
    
    fallback_summary = f"""# 📊 {trend}の調査レポート

## 📅 調査概要
- 調査日時: {current_date.strftime('%Y年%m月%d日')}
- 調査対象: {trend}
- 調査方法: Gemini AI による分析

## ⚠️ 調査状況
{current_month}現在、{trend}に関する詳細な分析を完了できませんでした。

### 🔍 発生した問題
- システムの一時的な問題
- 分析処理のエラー
- データ処理の制限

### 📋 推奨事項
1. **公式情報源の確認**
   - 関連企業の公式ウェブサイト
   - 業界団体の発表
   - 政府機関の報告書

2. **信頼できる情報源**
   - 主要ニュースメディア
   - 業界専門誌
   - 学術研究機関の報告

3. **再調査の実施**
   - 時間をおいて再度実行
   - より具体的なキーワードで検索
   - 複数の情報源での確認

## 🔄 次のステップ
より正確な情報を得るために、直接的な情報源の確認をお勧めします。

*注: このレポートは技術的な問題により限定的な内容となっています。*"""

    return {
        "detailed_summary": fallback_summary
    }

# LangGraphワークフローの作成
def create_trend_research_workflow():
    """
    LangGraphを使用したWeb検索+高速トレンド調査ワークフローを作成
    """
    workflow = StateGraph(TrendResearchState)
    
    # ノードの追加（状態キーと重複しない名前を使用）
    workflow.add_node("phase0_websearch", web_search_node)
    workflow.add_node("phase1_analysis", analysis_and_finalize_node)
    
    # エッジの設定（Web検索+1段階分析フロー）
    workflow.set_entry_point("phase0_websearch")
    workflow.add_edge("phase0_websearch", "phase1_analysis")
    workflow.add_edge("phase1_analysis", END)
    
    return workflow.compile()

# LangGraphワークフローのインスタンス化
trend_research_workflow = create_trend_research_workflow()
print("✅ LangGraph Web検索 + 高速トレンド調査ワークフローを作成")

# 公開関数: フル検索
def execute_full_search(trend: str) -> Dict[str, Any]:
    """
    LangGraphワークフローを使用してWeb検索+高速フル検索を実行
    
    Args:
        trend: 検索対象のトレンド
        
    Returns:
        検索結果の辞書
    """
    try:
        print(f"🎯 [Search] Web検索 + 高速Gemini分析を開始: {trend}")
        
        # LangGraphワークフローの初期状態を設定
        initial_state = TrendResearchState(
            trend=trend,
            web_search_results=[],
            final_result={},
            error_message=""
        )
        
        # LangGraphワークフローの実行
        print("🔄 [Search] Web検索 + 高速LangGraphワークフローを実行中...")
        print("   フェーズ0: Web検索とデータ収集")
        print("   フェーズ1: 包括的分析と最終レポート生成")
        
        result = trend_research_workflow.invoke(initial_state)
        
        # 最終結果の取得
        final_result = result["final_result"]
        print(f"🎉 [Search] Web検索 + 高速Gemini分析が完了: {trend}")
        
        return final_result
        
    except Exception as e:
        print(f"❌ [Search] フル検索エラー: {e}")
        return create_fallback_analysis_dict(trend, f"フル検索エラー: {str(e)}")

# 公開関数: ヘルスチェック
def get_search_health_status() -> Dict[str, Any]:
    """
    検索システムのヘルスチェック
    
    Returns:
        ヘルスステータスの辞書
    """
    status = {
        "service": "Web検索連携Gemini AIトレンド調査アシスタント（高速版）",
        "status": "稼働中",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "gemini_ai": "稼働中" if llm else "利用不可",
            "langgraph_workflow": "稼働中" if trend_research_workflow else "利用不可",
            "web_search": "稼働中" if os.getenv("GOOGLE_SEARCH_API_KEY") else "フォールバックモード",
        },
        "analysis_method": "LangGraphワークフロー + Web検索 + 高速Gemini AI分析",
        "workflow_nodes": [
            "phase0_websearch",
            "phase1_analysis"
        ],
        "enhancement_features": [
            "リアルタイムWeb検索連携",
            "高速包括的分析",
            "最新ニュース重点調査",
            "包括的市場分析",
            "リスクと機会の評価"
        ]
    }
    
    # 全体的なステータス判定
    if not llm or not trend_research_workflow:
        status["status"] = "機能制限"
    
    return status