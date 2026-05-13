from app.extensions import db
from datetime import datetime

class Property(db.Model):
    """
    This class defines what a 'Property' (a room or flat) looks like in our database.
    It stores details like the address, rent amount, and available amenities.
    """
    __tablename__ = 'properties'
    
    # Unique ID and the user who listed the property
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # --- Basic Property Information ---
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    locality = db.Column(db.String(100), nullable=False)
    
    # --- Room & Rent Specifics ---
    rent_amount = db.Column(db.Integer, nullable=False)
    room_type = db.Column(db.String(50), nullable=False) # e.g., 'Private' or 'Shared'
    occupancy_count = db.Column(db.Integer, default=1)   # How many roommates are needed
    amenities = db.Column(db.Text, nullable=True)       # List of features (AC, WiFi, etc.)
    available_from = db.Column(db.DateTime, nullable=True)
    
    # --- Photos and Stats ---
    images = db.Column(db.Text, nullable=True)          # Links to the property photos
    rating = db.Column(db.Float, default=0.0)           # Average user rating
    views = db.Column(db.Integer, default=0)            # How many times people viewed this
    
    # Timestamps to track when the property was listed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        """Displays a friendly name for the property in logs."""
        return f"<Property {self.title} at {self.locality}>"
