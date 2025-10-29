"""
LangChain + LangGraph を使用したGemini APIベースのトレンド調査システム
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime, date

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

# LangGraph imports
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

# Initialize Gemini AI
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0,
    convert_system_message_to_human=True
)

# LangGraph State Definition
class TrendResearchState(TypedDict):
    trend: str
    analysis_result: Dict[str, Any]
    final_result: Dict[str, Any]
    error_message: str

print("✅ Gemini-based Trend Research Assistant with LangGraph initialized")

# LangGraph Node Functions
def analyze_trend_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: Gemini APIを使用してトレンドを調査・分析
    """
    trend = state["trend"]
    print(f"🤖 [LangGraph] Starting Gemini-based trend analysis for: {trend}")
    
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.strftime("%Y年%m月")
    
    # Gemini APIベース調査アシスタントのプロンプト
    analysis_prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=f"""あなたは{current_month}時点での最新トレンドに関する調査の専門家です。
注目されている情報をWeb検索を用いて調査することを得意とします。

出力形式: 以下のJSON形式で回答してください
{{
  "trend": "調査対象のトレンド名",
  "summary": "詳細なMarkdown形式の調査レポート全文",
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
  "insights": [
    "重要な洞察1",
    "重要な洞察2",
    "重要な洞察3"
  ],
  "latest_developments": [
    "{current_year}年の最新動向1",
    "{current_year}年の最新動向2"
  ],
  "market_analysis": {{
    "current_status": "現在の市場状況",
    "growth_trend": "成長トレンド",
    "key_players": ["主要企業1", "主要企業2"]
  }},
  "future_outlook": [
    "{current_year}年以降の展望1",
    "{current_year}年以降の展望2"
  ],
  "reliability_note": "この分析の信頼性と情報源に関する注記"
}}

必ずJSONフォーマットで回答してください。"""),
        
        HumanMessage(content=f"""
調査対象: {trend}
上記のトレンドについて、発表を含めた最新情報をWeb検索を用いて教えてください。
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
        
        analysis = json.loads(analysis_text)
        state["analysis_result"] = analysis
        print("✅ [LangGraph] Gemini analysis completed successfully")
        return state
        
    except json.JSONDecodeError as e:
        print(f"❌ [LangGraph] JSON parsing error: {e}")
        state["error_message"] = f"分析結果のJSON解析エラー: {str(e)}"
        state["analysis_result"] = create_fallback_analysis_dict(trend, state["error_message"])
        return state
    except Exception as e:
        print(f"❌ [LangGraph] Analysis error: {e}")
        state["error_message"] = f"分析エラー: {str(e)}"
        state["analysis_result"] = create_fallback_analysis_dict(trend, state["error_message"])
        return state

def finalize_result_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: 最終結果を生成
    """
    trend = state["trend"]
    analysis_result = state["analysis_result"]
    print(f"📋 [LangGraph] Finalizing research report for: {trend}")
    
    # 最終結果の生成
    final_result = {
        **analysis_result,
        "research_timestamp": datetime.now().isoformat(),
        "research_type": "Gemini AI Trend Research",
        "analysis_method": "LangGraph Workflow + Gemini AI Analysis",
        "workflow_steps": [
            "1. Gemini AI Analysis",
            "2. Result Finalization"
        ]
    }
    
    state["final_result"] = final_result
    print("✅ [LangGraph] Research report finalized")
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
        "trend": trend,
        "summary": fallback_summary,
        "keywords": [trend, "調査", "エラー"],
        "insights": [
            "システムの一時的な問題が発生",
            "詳細な分析が完了できない状況",
            "直接的な情報源の確認が推奨される"
        ],
        "latest_developments": [
            f"{current_year}年の詳細な動向分析は利用できません"
        ],
        "market_analysis": {
            "current_status": "分析データが利用できません",
            "growth_trend": "データ不足により判定不可",
            "key_players": ["情報取得エラー"]
        },
        "future_outlook": [
            "技術的な問題により将来展望の分析ができません"
        ],
        "reliability_note": f"技術的な問題により信頼性が制限されています: {error_message}",
        "error_info": error_message
    }

# LangGraphワークフローの作成
def create_trend_research_workflow():
    """
    LangGraphを使用したトレンド調査ワークフローを作成
    """
    workflow = StateGraph(TrendResearchState)
    
    # ノードの追加
    workflow.add_node("analyze_trend", analyze_trend_node)
    workflow.add_node("finalize_result", finalize_result_node)
    
    # エッジの設定
    workflow.set_entry_point("analyze_trend")
    workflow.add_edge("analyze_trend", "finalize_result")
    workflow.add_edge("finalize_result", END)
    
    return workflow.compile()

# LangGraphワークフローのインスタンス化
trend_research_workflow = create_trend_research_workflow()
print("✅ LangGraph trend research workflow created")

# 公開関数: フル検索
def execute_full_search(trend: str) -> Dict[str, Any]:
    """
    LangGraphワークフローを使用してフル検索を実行
    
    Args:
        trend: 検索対象のトレンド
        
    Returns:
        検索結果の辞書
    """
    try:
        print(f"🎯 [Search] Starting Gemini-based analysis for: {trend}")
        
        # LangGraphワークフローの初期状態を設定
        initial_state = TrendResearchState(
            trend=trend,
            analysis_result={},
            final_result={},
            error_message=""
        )
        
        # LangGraphワークフローの実行
        print("🔄 [Search] Executing LangGraph workflow...")
        result = trend_research_workflow.invoke(initial_state)
        
        # 最終結果の取得
        final_result = result["final_result"]
        print(f"🎉 [Search] Gemini analysis completed for: {trend}")
        
        return final_result
        
    except Exception as e:
        print(f"❌ [Search] Full search error: {e}")
        return create_fallback_analysis_dict(trend, f"フル検索エラー: {str(e)}")

# 公開関数: ヘルスチェック
def get_search_health_status() -> Dict[str, Any]:
    """
    検索システムのヘルスチェック
    
    Returns:
        ヘルスステータスの辞書
    """
    status = {
        "service": "Gemini AI Trend Research Assistant",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "gemini_ai": "operational" if llm else "unavailable",
            "langgraph_workflow": "operational" if trend_research_workflow else "unavailable",
        },
        "analysis_method": "LangGraph Workflow + Gemini AI Analysis",
        "workflow_nodes": [
            "analyze_trend",
            "finalize_result"
        ]
    }
    
    # 全体的なステータス判定
    if not llm or not trend_research_workflow:
        status["status"] = "degraded"
    
    return status