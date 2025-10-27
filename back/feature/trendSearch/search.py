"""
LangChain + LangGraph を使用したトレンド検索システム
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

# Initialize AI News Research Assistant
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.2,  # 低い温度で事実に基づく回答を重視
    convert_system_message_to_human=True
)

# LangGraph State Definition
class TrendResearchState(TypedDict):
    trend: str
    context_info: str
    analysis_result: Dict[str, Any]
    final_result: Dict[str, Any]
    error_message: str

print("✅ AI News Research Assistant with LangGraph initialized")

# LangGraph Node Functions
def generate_context_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: AIの知識ベースを使用してトレンドのコンテキストを生成
    """
    trend = state["trend"]
    print(f"🧠 [LangGraph] Generating knowledge-based context for: {trend}")
    
    current_date = date.today()
    current_year = current_date.year
    current_month = current_date.strftime("%Y年%m月")
    
    context_info = f"""
AIの知識ベースを使用した{trend}の調査コンテキスト:

調査対象: {trend}
調査日時: {current_date.strftime('%Y年%m月%d日')}
調査方法: LangGraph + AI知識ベース分析

注意事項:
- この分析はAIの学習データに基づいています
- {current_year}年{current_month}の最新情報は含まれていない可能性があります
- より正確な最新情報については、公式情報源の確認をお勧めします

分析の基準:
- 一般的に知られている事実情報
- 業界の基本的な動向
- 技術的な背景知識
- 市場の一般的な傾向

LangGraphワークフロー:
1. コンテキスト生成 ✅
2. AI分析実行 → 次のステップ
3. 結果最終化 → 最終ステップ
    """.strip()
    
    state["context_info"] = context_info
    print("✅ [LangGraph] Context generation completed")
    return state

def analyze_trend_node(state: TrendResearchState) -> TrendResearchState:
    """
    LangGraphノード: AIの知識ベースを使用してトレンドを分析
    """
    trend = state["trend"]
    context_info = state["context_info"]
    print(f"🤖 [LangGraph] Analyzing trend with AI knowledge for: {trend}")
    
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.strftime("%Y年%m月")
    
    # AI知識ベース調査アシスタントのプロンプト
    analysis_prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=f"""あなたは信頼性の高いAI知識ベース調査アシスタント（LangGraph版）です。
現在の日付: {current_date.strftime('%Y年%m月%d日')}

重要な指針:
1. **知識ベースの活用**: あなたの学習データに基づく確実な情報のみを使用
2. **過度な憶測の回避**: 不確実な情報については明確に注記
3. **情報の鮮度注意**: 学習データの限界を明示
4. **客観的な報告**: 中立的で客観的な視点を維持
5. **情報の限界明示**: 知識の範囲と限界を明確に示す
6. **LangGraphワークフロー**: 構造化されたワークフローの一部として実行

出力形式: 必ずMarkdown形式で構造化してください。

以下のJSON形式で回答してください:
{{
  "trend": "調査対象のトレンド名",
  "summary": "Markdown形式の調査レポート（LangGraph + 知識ベースに基づく分析）",
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
  "insights": [
    "具体的な洞察1（知識ベースに基づく）",
    "具体的な洞察2（知識ベースに基づく）",
    "具体的な洞察3（知識ベースに基づく）"
  ],
  "general_trends": [
    "一般的な動向1",
    "一般的な動向2"
  ],
  "knowledge_sources": [
    "学習データに含まれる情報源の種類1",
    "学習データに含まれる情報源の種類2"
  ],
  "reliability_note": "この分析の信頼性と限界に関する注記（LangGraphワークフロー使用）",
  "workflow_info": "LangGraphワークフローによる構造化された分析プロセス"
}}

Markdownレポートの構造例:
```markdown
# 📚 {trend}のLangGraph知識ベース調査レポート

## 📅 調査日時
{current_date.strftime('%Y年%m月%d日')} 現在

## 🔄 LangGraphワークフロー
このレポートはLangGraphの構造化されたワークフローにより生成されました。

## 🔍 一般的な動向と背景
### 基本的な概要
- **定義**: {trend}の基本的な定義
- **特徴**: 主要な特徴や要素

## 📊 知識ベースからの情報
### 業界の一般的な状況
- 市場の基本的な構造
- 主要なプレイヤー（一般的に知られている）

## ⚠️ 情報の限界
- 学習データの時点での情報
- 最新の動向は含まれていない可能性
- より正確な情報は公式情報源で確認が必要
```

必ずJSONフォーマットで回答し、知識の限界を明確に示してください。"""),
        
        HumanMessage(content=f"""
調査対象: {trend}
調査日時: {current_date.strftime('%Y年%m月%d日')}
LangGraphワークフロー: 分析ノード実行中

=== 調査コンテキスト ===
{context_info}

LangGraphワークフローの一部として、あなたの知識ベースを活用して{trend}について客観的で事実に基づく調査レポートを作成してください。

調査の重点:
1. **確実な知識のみ**を報告
2. **一般的に知られている事実**を中心に分析
3. **業界の基本的な動向**を説明
4. **知識の限界**を明確に示す
5. **Markdown形式**で読みやすく構造化
6. **LangGraphワークフロー**の一部として実行されていることを明記

不確実な情報や推測は避け、学習データに基づく確実な知識のみを報告してください。
最新情報の限界についても明記してください。
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
        print("✅ [LangGraph] AI analysis completed successfully")
        return state
        
    except json.JSONDecodeError as e:
        print(f"❌ [LangGraph] JSON parsing error: {e}")
        state["error_message"] = f"AI分析のJSON解析エラー: {str(e)}"
        state["analysis_result"] = create_fallback_analysis_dict(trend, state["error_message"])
        return state
    except Exception as e:
        print(f"❌ [LangGraph] AI analysis error: {e}")
        state["error_message"] = f"AI分析エラー: {str(e)}"
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
        "research_type": "LangGraph AI Knowledge Research",
        "analysis_method": "LangGraph Workflow + AI Knowledge Base",
        "workflow_steps": [
            "1. Context Generation",
            "2. AI Knowledge Analysis", 
            "3. Result Finalization"
        ]
    }
    
    state["final_result"] = final_result
    print("✅ [LangGraph] Research report finalized")
    return state

def create_fallback_analysis_dict(trend: str, error_message: str) -> Dict[str, Any]:
    """
    AI分析が失敗した場合のフォールバック分析（辞書形式）
    """
    current_date = datetime.now()
    current_month = current_date.strftime("%Y年%m月")
    
    fallback_summary = f"""# 📰 {trend}のLangGraph調査レポート

## 📅 調査日時
{current_date.strftime('%Y年%m月%d日')} 現在

## 🔄 LangGraphワークフロー
このレポートはLangGraphワークフローで生成されましたが、分析中に問題が発生しました。

## ⚠️ 調査状況
{current_month}現在、{trend}に関する詳細な分析を完了できませんでした。

### 🔍 調査の制限事項
- AI分析システムの一時的な問題
- データ処理エラー
- LangGraphワークフローの実行エラー

### 📋 推奨事項
1. **公式情報源の確認**
   - 関連企業の公式ウェブサイト
   - 業界団体の発表
   - 政府機関の報告書

2. **信頼できるニュースメディア**
   - 主要新聞社のウェブサイト
   - 業界専門誌
   - 技術系ニュースサイト

3. **再調査の実施**
   - 時間をおいて再度検索
   - より具体的なキーワードでの検索
   - 複数の情報源での確認

## 🔄 次のステップ
より正確な情報を得るために、直接的な情報源の確認をお勧めします。

*注: このレポートはLangGraphワークフローの技術的な問題により限定的な内容となっています。*"""

    return {
        "trend": trend,
        "summary": fallback_summary,
        "keywords": [trend, "分析", "エラー"],
        "insights": [
            "LangGraphワークフローで一時的な問題が発生",
            "詳細な分析が完了できない状況",
            "直接的な情報源の確認が推奨される"
        ],
        "general_trends": [
            f"{current_month}の詳細な動向分析は利用できません"
        ],
        "knowledge_sources": [
            "LangGraphワークフローの処理に問題が発生"
        ],
        "reliability_note": f"LangGraphワークフローの技術的な問題により信頼性が制限されています: {error_message}",
        "workflow_info": "LangGraphワークフローでエラーが発生しました",
        "error_info": error_message
    }

# LangGraphワークフローの作成
def create_trend_research_workflow():
    """
    LangGraphを使用したトレンド調査ワークフローを作成
    """
    workflow = StateGraph(TrendResearchState)
    
    # ノードの追加
    workflow.add_node("generate_context", generate_context_node)
    workflow.add_node("analyze_trend", analyze_trend_node)
    workflow.add_node("finalize_result", finalize_result_node)
    
    # エッジの設定
    workflow.set_entry_point("generate_context")
    workflow.add_edge("generate_context", "analyze_trend")
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
        print(f"🎯 [Search] Starting full search for: {trend}")
        
        # LangGraphワークフローの初期状態を設定
        initial_state = TrendResearchState(
            trend=trend,
            context_info="",
            analysis_result={},
            final_result={},
            error_message=""
        )
        
        # LangGraphワークフローの実行
        print("🔄 [Search] Executing LangGraph workflow...")
        result = trend_research_workflow.invoke(initial_state)
        
        # 最終結果の取得
        final_result = result["final_result"]
        print(f"🎉 [Search] Full search completed for: {trend}")
        
        return final_result
        
    except Exception as e:
        print(f"❌ [Search] Full search error: {e}")
        return create_fallback_analysis_dict(trend, f"フル検索エラー: {str(e)}")

# 公開関数: シンプル検索
def execute_simple_search(trend: str) -> Dict[str, Any]:
    """
    LangGraphワークフローを使用してシンプル検索を実行
    
    Args:
        trend: 検索対象のトレンド
        
    Returns:
        検索結果の辞書
    """
    try:
        print(f"⚡ [Search] Starting simple search for: {trend}")
        
        # 簡易版の初期状態（コンテキスト生成をスキップ）
        initial_state = TrendResearchState(
            trend=trend,
            context_info=f"クイック調査: {trend}の基本的なLangGraph知識ベース分析",
            analysis_result={},
            final_result={},
            error_message=""
        )
        
        # 分析ノードのみ実行（簡易版）
        print("🔄 [Search] Executing simple analysis...")
        state_after_analysis = analyze_trend_node(initial_state)
        final_state = finalize_result_node(state_after_analysis)
        
        final_result = final_state["final_result"]
        final_result["research_type"] = "Quick LangGraph AI Knowledge Research"
        final_result["analysis_method"] = "Quick LangGraph Workflow"
        
        print(f"⚡ [Search] Simple search completed for: {trend}")
        return final_result
        
    except Exception as e:
        print(f"❌ [Search] Simple search error: {e}")
        return create_fallback_analysis_dict(trend, f"シンプル検索エラー: {str(e)}")

# 公開関数: ヘルスチェック
def get_search_health_status() -> Dict[str, Any]:
    """
    検索システムのヘルスチェック
    
    Returns:
        ヘルスステータスの辞書
    """
    status = {
        "service": "LangGraph AI Knowledge Research Assistant",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "ai_model": "operational" if llm else "unavailable",
            "langgraph_workflow": "operational" if trend_research_workflow else "unavailable",
            "knowledge_base": "operational",
        },
        "analysis_method": "LangGraph Workflow + AI Knowledge Base",
        "workflow_nodes": [
            "generate_context",
            "analyze_trend", 
            "finalize_result"
        ]
    }
    
    # 全体的なステータス判定
    if not llm or not trend_research_workflow:
        status["status"] = "degraded"
    
    return status