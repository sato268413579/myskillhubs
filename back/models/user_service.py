"""
ユーザーとサービスの関連モデル
"""
from config.db import db
from datetime import datetime


class UserService(db.Model):
    """ユーザーが利用可能なサービスを管理"""
    __tablename__ = 'user_services'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment='ユーザーID')
    service_id = db.Column(db.String(50), nullable=False, comment='サービスID')
    is_enabled = db.Column(db.Boolean, default=True, comment='有効/無効')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # ユニーク制約（同じユーザーが同じサービスを複数持てない）
    __table_args__ = (
        db.UniqueConstraint('user_id', 'service_id', name='unique_user_service'),
        db.Index('idx_user_id', 'user_id'),
        db.Index('idx_service_id', 'service_id'),
    )
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'service_id': self.service_id,
            'is_enabled': self.is_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class UserRole(db.Model):
    """ユーザーロール管理（将来の拡張用）"""
    __tablename__ = 'user_roles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, comment='ユーザーID')
    role = db.Column(
        db.Enum('admin', 'manager', 'user', 'guest', name='user_role_type'),
        default='user',
        comment='ロール'
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', name='unique_user_role'),
        db.Index('idx_user_id_role', 'user_id'),
    )
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
