"""
工事工程管理機能のSQLAlchemyモデル
"""
from config.db import db
from datetime import datetime


class Project(db.Model):
    """工事プロジェクトモデル"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment='ユーザーID')
    name = db.Column(db.String(255), nullable=False, comment='プロジェクト名')
    description = db.Column(db.Text, comment='プロジェクト説明')
    client_name = db.Column(db.String(255), comment='顧客名')
    site_location = db.Column(db.String(500), comment='工事現場住所')
    start_date = db.Column(db.Date, comment='プロジェクト開始予定日')
    end_date = db.Column(db.Date, comment='プロジェクト終了予定日')
    status = db.Column(
        db.Enum('planning', 'in_progress', 'completed', 'on_hold', name='project_status'),
        default='planning',
        comment='ステータス'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーション
    milestones = db.relationship('Milestone', backref='project', cascade='all, delete-orphan', lazy='dynamic')
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'client_name': self.client_name,
            'site_location': self.site_location,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'milestones_count': self.milestones.count()
        }


class Milestone(db.Model):
    """工程マイルストーンモデル"""
    __tablename__ = 'milestones'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, comment='プロジェクトID')
    name = db.Column(db.String(255), nullable=False, comment='工程名')
    description = db.Column(db.Text, comment='工程説明')
    start_date = db.Column(db.DateTime, nullable=False, comment='開始日時')
    end_date = db.Column(db.DateTime, nullable=False, comment='終了日時')
    display_order = db.Column(db.Integer, default=0, comment='表示順序')
    status = db.Column(
        db.Enum('not_started', 'in_progress', 'completed', 'delayed', name='milestone_status'),
        default='not_started',
        comment='ステータス'
    )
    progress_percentage = db.Column(db.Integer, default=0, comment='進捗率（0-100）')
    assigned_to = db.Column(db.String(255), comment='担当者')
    color = db.Column(db.String(7), default='#3B82F6', comment='表示色（HEX）')
    notes = db.Column(db.Text, comment='備考')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーション
    history = db.relationship('MilestoneHistory', backref='milestone', cascade='all, delete-orphan', lazy='dynamic')
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'display_order': self.display_order,
            'status': self.status,
            'progress_percentage': self.progress_percentage,
            'assigned_to': self.assigned_to,
            'color': self.color,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_gantt_format(self):
        """ガントチャート用フォーマットに変換"""
        return {
            'id': str(self.id),
            'name': self.name,
            'start': self.start_date.strftime('%Y-%m-%d'),
            'end': self.end_date.strftime('%Y-%m-%d'),
            'progress': self.progress_percentage,
            'custom_class': f'status-{self.status}',
            'dependencies': ''  # 将来実装
        }


class MilestoneDependency(db.Model):
    """工程依存関係モデル（将来実装用）"""
    __tablename__ = 'milestone_dependencies'
    
    id = db.Column(db.Integer, primary_key=True)
    predecessor_id = db.Column(db.Integer, db.ForeignKey('milestones.id'), nullable=False, comment='先行工程ID')
    successor_id = db.Column(db.Integer, db.ForeignKey('milestones.id'), nullable=False, comment='後続工程ID')
    dependency_type = db.Column(
        db.Enum('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish', name='dependency_type'),
        default='finish_to_start',
        comment='依存関係タイプ'
    )
    lag_days = db.Column(db.Integer, default=0, comment='遅延日数')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'predecessor_id': self.predecessor_id,
            'successor_id': self.successor_id,
            'dependency_type': self.dependency_type,
            'lag_days': self.lag_days,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MilestoneHistory(db.Model):
    """工程変更履歴モデル"""
    __tablename__ = 'milestone_history'
    
    id = db.Column(db.Integer, primary_key=True)
    milestone_id = db.Column(db.Integer, db.ForeignKey('milestones.id'), nullable=False, comment='マイルストーンID')
    field_name = db.Column(db.String(100), nullable=False, comment='変更フィールド名')
    old_value = db.Column(db.Text, comment='変更前の値')
    new_value = db.Column(db.Text, comment='変更後の値')
    changed_by = db.Column(db.String(255), comment='変更者')
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'milestone_id': self.milestone_id,
            'field_name': self.field_name,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'changed_by': self.changed_by,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None
        }
