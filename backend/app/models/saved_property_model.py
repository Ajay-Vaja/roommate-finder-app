from app.extensions import db
from datetime import datetime

class SavedProperty(db.Model):
    """
    This model acts as a bookmarking system for users.
    It links a specific user (seeker) to a property they liked.
    """
    __tablename__ = 'saved_properties'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    
    # Timestamp to track when the property was saved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Helper relationships to easily access the user or the property data
    user = db.relationship('User', backref=db.backref('saved_properties', lazy='dynamic'))
    property = db.relationship('Property', backref=db.backref('saved_by_users', lazy='dynamic'))

    def __repr__(self):
        return f"<SavedProperty User:{self.user_id} -> Prop:{self.property_id}>"
