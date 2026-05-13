from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.services.auth_service import (
    register_init, 
    register_verify, 
    authenticate_user, 
    get_user_by_id,
    forgot_password_init,
    reset_password_verify,
    refresh_access_token
)

def register():
    """
    Step 1 of registration: Collects user data and triggers OTP generation.
    Expected JSON: { name, email, password, phone, ... }
    """
    data = request.get_json()
    result, status_code = register_init(data)
    return jsonify(result), status_code

def verify_otp():
    """
    Step 2 of registration: Verifies the OTP sent to email and creates the user account.
    Expected JSON: { email, otp }
    """
    data = request.get_json()
    if not data or not data.get('email') or not data.get('otp'):
        return jsonify({"msg": "Email and OTP are required"}), 400
        
    result, status_code = register_verify(data['email'], data['otp'])
    return jsonify(result), status_code

def login():
    """
    Authenticates a user and returns Access & Refresh JWT tokens.
    Expected JSON: { email, password }
    """
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400
        
    result, status_code = authenticate_user(data.get('email'), data.get('password'))
    return jsonify(result), status_code

def forgot_password():
    """
    Initiates the password recovery process by sending an OTP to the user's email.
    Expected JSON: { email }
    """
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({"msg": "Email is required"}), 400
    
    result, status_code = forgot_password_init(data['email'])
    return jsonify(result), status_code

def reset_password():
    """
    Verifies the recovery OTP and updates the user's password.
    Expected JSON: { email, otp, new_password }
    """
    data = request.get_json()
    if not data or not data.get('email') or not data.get('otp') or not data.get('new_password'):
        return jsonify({"msg": "Email, OTP and new password are required"}), 400
    
    result, status_code = reset_password_verify(data['email'], data['otp'], data['new_password'])
    return jsonify(result), status_code

@jwt_required()
def get_me():
    """
    Retrieves the current authenticated user's profile information.
    Requires a valid Access Token in the Authorization header.
    """
    # get_jwt_identity() extracts the user ID (subject) from the JWT
    current_user_id = get_jwt_identity()

    result, status_code = get_user_by_id(current_user_id)
    return jsonify(result), status_code

@jwt_required(refresh=True)
def refresh():
    """
    Generates a new Access Token using a valid Refresh Token.
    Requires a valid Refresh Token in the Authorization header.
    """
    current_user_id = get_jwt_identity()
    result, status_code = refresh_access_token(current_user_id)
    return jsonify(result), status_code