from app.extensions import db
from datetime import datetime

class Profile(db.Model):
    """
    This class stores the 'Life Details' of a user.
    It tracks their habits, room preferences, and the number of people involved.
    """
    __tablename__ = 'profiles'
    
    # Linking the profile to a specific user
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # The user's photo (saved as a long string of text)
    profile_pic = db.Column(db.Text, nullable=True)
    
    # --- Everyday Lifestyle Habits ---
    sleep_schedule = db.Column(db.String(50), nullable=True) # e.g., 'Early bird' or 'Night owl'
    cleanliness = db.Column(db.String(50), nullable=True)    # e.g., 'Very clean' or 'Relaxed'
    guests_policy = db.Column(db.String(50), nullable=True)  # e.g., 'No guests' or 'Occasional'
    smoking = db.Column(db.String(20), nullable=True)       # 'Yes' or 'No'
    drinking = db.Column(db.String(20), nullable=True)      # 'Yes' or 'No'
    pets = db.Column(db.String(20), nullable=True)          # 'Yes' or 'No'
    food_habits = db.Column(db.String(50), nullable=True)   # 'Veg' or 'Non-Veg'
    noise_level = db.Column(db.String(50), nullable=True)   # 'Quiet' or 'Lively'
    work_from_home = db.Column(db.String(50), nullable=True) # 'Yes' or 'No'
    
    # How many people are moving in (for Seekers) or how many people are needed (for Listers)
    occupancy_count = db.Column(db.Integer, default=1)
    
    # --- Looking for a Room (Only for 'Seekers') ---
    preferred_city = db.Column(db.String(100), nullable=True)
    min_budget = db.Column(db.Integer, nullable=True)
    max_budget = db.Column(db.Integer, nullable=True)
    preferred_areas = db.Column(db.Text, nullable=True)     # List of areas separated by commas
    move_in_date = db.Column(db.DateTime, nullable=True)
    room_type_pref = db.Column(db.String(50), nullable=True) # 'Private' or 'Shared'
    
    # Remembers when the profile was last updated
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        """Displays which user this profile belongs to in the logs."""
        return f"<Profile for User {self.user_id}>"
