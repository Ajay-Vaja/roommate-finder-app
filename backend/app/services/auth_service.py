from datetime import datetime
from app.models.user_model import User
from app.models.profile_model import Profile
from app.models.property_model import Property
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token
from app.utils.validators import validate_password
from app.services.otp_service import (
    generate_otp, 
    send_otp_email, 
    send_forgot_password_email,
    save_otp, 
    verify_otp_logic
)

def register_user(data):
    """
    Final step of account creation.
    Creates a new user record in the database after OTP verification.
    """
    if User.query.filter_by(email=data['email']).first():
        return {"msg": "User already exists"}, 409
        
    try:
        new_user = User()
        new_user.name = data.get('name', '')
        new_user.email = data['email']
        new_user.phone = data.get('phone')
        new_user.age = data.get('age')
        new_user.gender = data.get('gender')
        new_user.occupation = data.get('occupation')
        new_user.user_type = data.get('user_type', 'Seeker')
        new_user.is_verified = True # They verified via OTP
        
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        
        # Notify Admin about new registration
        from app.services.notification_service import create_notification
        create_notification(new_user.id, f"New user {new_user.name} has registered on the platform.", "registration")
        
        return {'msg': 'Account created successfully!'}, 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {e}")
        return {"msg": "Internal server error"}, 500

def register_init(data):
    """
    Initializes registration by validating input and sending an OTP.
    Stores temporary user data in the OTP table.
    """
    # Basic validation
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return {"msg": "Missing required fields"}, 400

    # Validate password strength against security rules
    is_valid, error_msg = validate_password(data.get('password', ''))
    if not is_valid:
        return {"msg": error_msg}, 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return {"msg": "User already exists"}, 409

    # Generate and send OTP via email
    otp_code = generate_otp()
    if send_otp_email(data['email'], otp_code):
        save_otp(data['email'], otp_code, data)
        return {"msg": f"Verification code sent to {data['email']}"}, 200
    else:
        return {"msg": "Failed to send verification email. Please check your email address."}, 500

def register_verify(email, otp_code):
    """
    Verifies the registration OTP.
    If valid, proceeds to create the user account.
    """
    success, result = verify_otp_logic(email, otp_code)
    
    if not success:
        return {"msg": result}, 400
    
    # result contains the user_data stored during register_init
    return register_user(result)

def authenticate_user(email, password):
    """
    Validates user credentials and issues tokens.
    Includes 'self-healing' logic to correct profile completion status if needed.
    """
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return {"msg": "Invalid credentials"}, 401
    
    # Self-healing logic: 
    # If the user has completed profile data but the flag is false, fix it automatically.
    if not user.is_profile_complete:
        has_profile = db.session.query(Profile).filter_by(user_id=user.id).first() is not None
        has_property = db.session.query(Property).filter_by(user_id=user.id).first() is not None
        
        # If they have a profile or property listing, mark as complete
        if has_profile or has_property:
            user.is_profile_complete = True
            db.session.commit()
    
    # Update last login timestamp for analytics/security
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    # Fetch profile pic for frontend display
    profile = Profile.query.filter_by(user_id=user.id).first()
    profile_pic = profile.profile_pic if profile else None

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "user": {
            "id": user.id, 
            "name": user.name, 
            "email": user.email,
            "user_type": user.user_type,
            "role": user.role,
            "phone": user.phone,
            "is_profile_complete": user.is_profile_complete,
            "profile_pic": profile_pic
        }
    }, 200

def forgot_password_init(email):
    """
    Starts the password reset flow.
    Sends a specific 'Forgot Password' OTP email.
    """
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"msg": "User with this email does not exist"}, 404
        
    otp_code = generate_otp()
    if send_forgot_password_email(email, otp_code):
        save_otp(email, otp_code, {}) # No extra user_data needed for reset
        return {"msg": f"Verification code sent to {email}"}, 200
    else:
        return {"msg": "Failed to send reset email. Please check your email address."}, 500

def reset_password_verify(email, otp_code, new_password):
    """
    Verifies the reset OTP and updates the user's password.
    """
    # Ensure the new password meets security requirements
    is_valid, error_msg = validate_password(new_password)
    if not is_valid:
        return {"msg": error_msg}, 400

    success, result = verify_otp_logic(email, otp_code)
    
    if not success:
        return {"msg": result}, 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"msg": "User not found"}, 404
        
    try:
        user.set_password(new_password)
        db.session.commit()
        return {"msg": "Password reset successfully!"}, 200
    except Exception as e:
        db.session.rollback()
        return {"msg": "Internal server error"}, 500

def get_user_by_id(user_id):
    """
    Fetches user details by ID for the 'get_me' endpoint.
    Also performs self-healing on the profile completion flag.
    """
    user = User.query.get(user_id)
    if not user:
        return {'msg': "User Not found"},404

    # Periodic self-healing check
    if not user.is_profile_complete:
        has_profile = db.session.query(Profile).filter_by(user_id=user.id).first() is not None
        if has_profile:
            user.is_profile_complete = True
            db.session.commit()

    profile = Profile.query.filter_by(user_id=user.id).first()
    profile_pic = profile.profile_pic if profile else None

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "role": user.role,
        "phone": user.phone,
        "is_profile_complete": user.is_profile_complete,
        "profile_pic": profile_pic,
        "created_at": user.created_at
    }, 200

def refresh_access_token(user_id):
    """
    Generates a new access token using a valid refresh token identity.
    """
    user = User.query.get(user_id)
    if not user:
        return {"msg": "User not found"}, 404
        
    access_token = create_access_token(identity=str(user.id))
    return {"access_token": access_token}, 200
