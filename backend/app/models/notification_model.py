from ..extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'registration', 'onboarding', 'photo_update'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to user who triggered it (optional)
    trigger_user = db.relationship('User', backref='triggered_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'user_name': self.trigger_user.name if self.trigger_user else "System"
        }
