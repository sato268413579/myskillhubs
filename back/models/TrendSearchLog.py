from datetime import datetime
from config.db import db
import json

class TrendSearchLog(db.Model):
    __tablename__ = "trend_search_log"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    search_query = db.Column(db.Text, nullable=False)
    search_type = db.Column(db.String(50), default='basic')  # basic, advanced, multi_source
    
    # 検索結果データ
    result_summary = db.Column(db.Text)
    keywords = db.Column(db.Text)  # JSON形式で保存
    insights = db.Column(db.Text)  # JSON形式で保存
    sources_used = db.Column(db.Text)  # JSON形式で保存
    confidence_score = db.Column(db.Float, default=0.0)
    
    # メタデータ
    search_duration = db.Column(db.Float)  # 検索にかかった時間（秒）
    tokens_used = db.Column(db.Integer, default=0)
    retry_count = db.Column(db.Integer, default=0)
    success = db.Column(db.Boolean, default=True)
    error_message = db.Column(db.Text)
    
    # タイムスタンプ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 検索期間
    search_period_start = db.Column(db.Date)
    search_period_end = db.Column(db.Date)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "search_query": self.search_query,
            "search_type": self.search_type,
            "result_summary": self.result_summary,
            "keywords": json.loads(self.keywords) if self.keywords else [],
            "insights": json.loads(self.insights) if self.insights else [],
            "sources_used": json.loads(self.sources_used) if self.sources_used else [],
            "confidence_score": self.confidence_score,
            "search_duration": self.search_duration,
            "tokens_used": self.tokens_used,
            "retry_count": self.retry_count,
            "success": self.success,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "search_period_start": self.search_period_start.isoformat() if self.search_period_start else None,
            "search_period_end": self.search_period_end.isoformat() if self.search_period_end else None,
        }
    
    def set_keywords(self, keywords_list):
        """キーワードリストをJSON形式で保存"""
        self.keywords = json.dumps(keywords_list, ensure_ascii=False)
    
    def set_insights(self, insights_list):
        """洞察リストをJSON形式で保存"""
        self.insights = json.dumps(insights_list, ensure_ascii=False)
    
    def set_sources(self, sources_list):
        """ソースリストをJSON形式で保存"""
        self.sources_used = json.dumps(sources_list, ensure_ascii=False)
