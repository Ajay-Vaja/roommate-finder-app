from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """
    This class defines what a 'User' looks like in our database.
    It stores their name, email, password, and whether they are looking for a room or listing one.
    """
    __tablename__ = 'users'
    
    # Core identity information
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Personal details
    gender = db.Column(db.String(10), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    
    # User roles: 'Seeker' (looking for a room) or 'Lister' (has a room)
    user_type = db.Column(db.String(20), nullable=False, default='Seeker')
    
    # Account status and permissions
    role = db.Column(db.String(20), default='User') # 'Admin' or 'User'
    is_profile_complete = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='Active')

    # Timestamps to track activity
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Connections to other data (Lifestyle profile and Property listings)
    profile = db.relationship('Profile', backref='user', uselist=False, cascade="all, delete-orphan")
    properties = db.relationship('Property', backref='owner', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        """Displays a friendly name for the user in logs."""
        return f"<User {self.email} ({self.user_type})>"

    def set_password(self, password):
        """Turns a plain text password into a secure, scrambled code."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the password entered matches the secure code we saved."""
        return check_password_hash(self.password_hash, password)


class OTP(db.Model):
    """
    This class stores temporary 'One-Time Passwords' (OTP).
    These are used to verify a user's email during signup or password reset.
    """
    __tablename__ = 'otps'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    
    # Temporary storage for user data until they verify their email
    user_data = db.Column(db.JSON, nullable=False)
    
    # Timing for when the code was sent and when it will stop working
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def is_expired(self):
        """Checks if the OTP code has run out of time."""
        return datetime.utcnow() > self.expires_at


