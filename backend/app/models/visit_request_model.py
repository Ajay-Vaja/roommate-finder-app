from app.extensions import db
from datetime import datetime

class VisitRequest(db.Model):
    """
    Model to store appointment requests for visiting properties.
    Links seekers to listers via properties.
    """
    __tablename__ = 'visit_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    seeker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    
    # Status of the request: 'Pending', 'Accepted', 'Rejected'
    status = db.Column(db.String(20), default='Pending')
    
    # Optional message from seeker to lister
    message = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships for easier data fetching
    # seeker = db.relationship('User', backref='visit_requests')
    # property = db.relationship('Property', backref='visit_requests')

    def __repr__(self):
        return f"<VisitRequest Seeker:{self.seeker_id} -> Prop:{self.property_id} [{self.status}]>"
